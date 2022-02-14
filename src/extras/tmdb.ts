import { createWriteStream, readFileSync } from 'fs';
import axios from "axios";
import { Movie } from "../schema/Movie";
import { TvShow } from "../schema/TvShow";
import tmdbGenres from "./tmdbGenres";
import { IFind, IMovie, IMultiSearch, IMultiSearchMovie, IMultiSearchTv, ISeason, ITvShow, IWatchProviders } from "./tmdbTypes";
import { IMongoTvShow } from "../schema/types";
import { WatchProvider } from "../schema/WatchProvider";
import { Types } from "mongoose";
import fromUnixTime from 'date-fns/fromUnixTime';
import { getUnixTime, getYear, isValid, parseISO } from 'date-fns';

interface ITMDBResult {
  media_type: string,
  popularity: number,
  release_date?: string, // movie
  first_air_date?: string, // tv
}

interface IMovieGetVideos {
  id?: number
  results?: [{
    iso_639_1?: string,
    iso_3166_1?: string,
    name?: string,
    key?: string,
    site?: string,
    size?: number
    type?: string
    official?: boolean,
    published_at?: string,
    id?: string,
  }]
}

class TMDB {
  token = ''

  readonly BASE_URL = 'https://api.themoviedb.org/3/';
  readonly POSTER_PATH = 'public/poster/';
  readonly LOGO_PATH = 'public/logo/';
  readonly WATCH_PROVIDER_PATH = 'public/watch_provider/';
  readonly IMAGE_BASE_URL = 'http://image.tmdb.org/t/p/';
  readonly IMAGE_POSTER_SIZE = 'w185';
  readonly IMAGE_LOGO_SIZE = 'w154';
  readonly DEBUG = false;
  readonly COUNTRIES = ['US', 'DE']

  WATCH_PROVIDERS_TV: Map<number, Types.ObjectId> = new Map();
  WATCH_PROVIDERS_MOVIE: Map<number, Types.ObjectId> = new Map();

  constructor(token: string) {
    this.token = token;
  }
  
  async populateWatchProviders() {
    if (this.WATCH_PROVIDERS_TV.size === 0) {
      const providers = await WatchProvider.find({'type': 'tv'});
      for (const provider of providers) {
        this.WATCH_PROVIDERS_TV.set(provider.provider_id, provider._id);       
      }
    }

    if (this.WATCH_PROVIDERS_MOVIE.size === 0) {
      const providers = await WatchProvider.find({'type': 'movie'});
      for (const provider of providers) {
        this.WATCH_PROVIDERS_MOVIE.set(provider.provider_id, provider._id);
      }
    }    
  }

  async multiSearch(query: string, debugFile?: string) {
    const url = `${this.BASE_URL}search/multi?api_key=${this.token}&query=${query}`;
    const resp = await axios.get<IMultiSearch>(url);
    return resp
  }

  async tvDetails(id: number, debugFile?: string) {
    if (this.DEBUG && debugFile) {
      console.log('tvDetails -> debugging:', id);
      return {
        data: JSON.parse(readFileSync(debugFile).toString())
      };
    }

    const url = `${this.BASE_URL}tv/${id}?api_key=${this.token}`;
    const resp = await axios.get(url);
    return resp 
  }

  async tvSeason(id: number, season: number, debugFile?: string) {
    if (this.DEBUG && debugFile) {
      console.log('tvSeason -> debugging:', id, season);
      return {
        data: JSON.parse(readFileSync(debugFile).toString())
      };
    }

    const url = `${this.BASE_URL}tv/${id}/season/${season}?api_key=${this.token}`;
    const resp = await axios.get(url);
    return resp 
  }

  // endpoint: /movie/{movie_id}/videos
  async getMovieVideos(id: string) {
    console.log('getMovieVideos', id);

    const url = `${this.BASE_URL}movie/${id}/videos?api_key=${this.token}`;
    const resp = await axios.get(url);
    return resp
  }

  async handleGetMovieVideos(data: IMovieGetVideos) {
    console.log('handleGetMovieVideos', data);
  }

  async searchIMDB(id: string) {
    console.log('searchIMDB', id);

    const url = `${this.BASE_URL}find/${id}?api_key=${this.token}&external_source=imdb_id`

    const resp = await axios.get<IFind>(url);    

    const movieResult = await this.handleMovies(resp.data.movie_results.map((e) => e.id));
    const tvShowResult = await this.handleTvShows(resp.data.tv_results.map((e) => e.id));

    const ret = (movieResult.popularity > tvShowResult.popularity) ? movieResult : tvShowResult;

    return {...ret, count: 1};
  }

  async searchTMDB(type: string, id: string) {
    console.log('searchTMDB', type, id);

    const movieIds = [];
    const tvShowIds = [];
    if (type === 'movie') {
      movieIds.push(+id);
    } else if (type === 'tv') {
      tvShowIds.push(+id);
    }

    const movieResult = await this.handleMovies(movieIds);
    const tvShowResult = await this.handleTvShows(tvShowIds);

    const ret = (movieResult.popularity > tvShowResult.popularity) ? movieResult : tvShowResult;

    return {...ret, count: 1};
  }

  /**
   * Main entry point.
   * 
   * @param query String to search for.
   * @returns 
   */
  async search(query: string) {
    console.log("tmdb -> search", query);

    await this.populateWatchProviders();

    const url = `${this.BASE_URL}search/multi?api_key=${this.token}&query=${query}`

    const resp = await axios.get<IMultiSearch>(encodeURI(url));
    //console.log("multiSearchReponse", resp.data);

    const popularityLimit = 20;

    // filter out movies & tv shows of interest
    const movies = resp.data.results.filter((e) => e.media_type === 'movie' && e.popularity > popularityLimit && e.original_language === 'en').map((e) => e.id);
    const tvShows = resp.data.results.filter((e) => e.media_type === 'tv' && e.popularity > popularityLimit && e.original_language === 'en').map((e) => e.id);

    const movieResult = await this.handleMovies(movies);
    const tvShowResult = await this.handleTvShows(tvShows);

    const ret = (movieResult.popularity > tvShowResult.popularity) ? movieResult : tvShowResult;

    return {...ret, count: tvShows.length + movies.length};
  }


  async getTrending(mediaType: string, timeWindow: string) {
    console.log("getTrending", mediaType, timeWindow);

    const url = `${this.BASE_URL}trending/${mediaType}/${timeWindow}?api_key=${this.token}`;

    const resp = await axios.get<IMultiSearch>(encodeURI(url));

    const ids = resp.data.results.map((e) => e.id.toString());

    if (mediaType === 'tv') {
      const tvShows = await TvShow.find({'tmdb_id': { $in: ids }});
      const skips = tvShows.map((e) => e.tmdb_id);
      await this.handleTvShows(ids.filter((id) => !skips.includes(id)).map((id) => +id))
    }

    //console.log("resp", resp.data.results);
  }

  async handleMovies(movieIds: number[]) {
    console.log("tmdb -> handleMovies", movieIds);

    const ret = { name: '', year: '', popularity: 0 }

    for (const movieId of movieIds) {
      console.log("looking for movie", movieId)
      const url = `${this.BASE_URL}movie/${movieId}?api_key=${this.token}&append_to_response=watch/providers,videos,external_ids,release_dates`
      const resp = await axios.get<IMovie>(url);
      const details = resp.data;
      console.log("detais", details);

      // figure out year & release date: skip non US releases and skip premieres
      let releaseDate = null;
      let year = null;

      // get US non-premiere release date
      const releases = details.release_dates?.results
        .find((e) => e.iso_3166_1 === 'US')?.release_dates?.filter((e) => e.type !== 1)
        .sort((a, b) => getUnixTime(parseISO(a.release_date)) - getUnixTime(parseISO(b.release_date)))
      
      if (releases && releases.length > 0) {
        releaseDate = parseISO(releases[0].release_date);
        year = getYear(releaseDate);
      }

      // watch/providers
      const watch_providers = [];
      for (const [iso_3166_1, data] of Object.entries(details['watch/providers'].results)) {
        for (const [type, providers] of Object.entries(data as object)) {
          if (type !== 'link') {
            for (const provider of providers) {
              const entry = {iso_3166_1, watch_provider: this.WATCH_PROVIDERS_MOVIE.get(provider.provider_id), type};
              watch_providers.push(entry);
            }
          }
        }
      }

      // external ids: only IMDB
      const ids: {name: string, id: string}[] = [];
      if (details.external_ids?.imdb_id) ids.push({name: 'imdb', id: details.external_ids?.imdb_id})

      // release_dates: only US & DE
      const releaseDates = details.release_dates?.results
        .filter((e) => e.iso_3166_1 === 'US' || e.iso_3166_1 === 'DE')
        .flatMap((e) => (
          e.release_dates.map((r) => { return ( {iso_3166_1: e.iso_3166_1, ...r }) })
        ));

      console.log(releaseDates);

      const update = {
        tmdb_id: details.id,
        title: details.title,        
        overview: details.overview,
        tagline: details.tagline,
        status: details.status,
        year: year,
        runtime: details.runtime,
        popularity: details.popularity,
        release_date: releaseDate,    
        homepage: details.homepage,
        genres: details.genres.map((e) => e.name),
        external_ids: ids,
        videos: details.videos?.results,
        release_dates: releaseDates,
        watch_providers: watch_providers,
      }

      if (details.popularity > ret.popularity && year) {
        ret.name = details.title;
        ret.year = year.toString();
        ret.popularity = details.popularity;
      }

      console.log("trying to insert", update);

      const doc = await Movie.findOneAndUpdate({'tmdb_id': details.id.toString()}, {$set: update}, {
        upsert: true,
        new: true,
      });

      if (details.poster_path)
        await this.downloadImage(`${this.IMAGE_BASE_URL}${this.IMAGE_POSTER_SIZE}${details.poster_path}`, this.POSTER_PATH, doc._id);

      //break;         
    }

    console.log("ret", ret);

    return ret;
  }

  async updateSeason(tvShowId: number, seasonNumber: number) {
    console.log('updateSeason', tvShowId, seasonNumber);

    const tvShow = await TvShow.findOne({'tmdb_id': tvShowId.toString()});
    if (!tvShow) {
      return;
    }   

    const url = `${this.BASE_URL}tv/${tvShowId}/season/${seasonNumber}?api_key=${this.token}&append_to_response=videos,external_ids`
    const resp = await axios.get<ISeason>(url);
    const details = resp.data;

    const episodes = details.episodes?.map((e) => {
      const airDate = parseISO(e.air_date ? e.air_date : '');
      return {
        id: e.id,
        air_date: isValid(airDate) ? airDate : null,
        episode_number: e.episode_number,
        name: e.name,
        overview: e.overview,
        production_code: e.production_code,
        season_number: e.season_number,
      }
    });

    const seasonAirDate = parseISO(details.air_date ? details.air_date : '');
    const season = {
      air_date:  isValid(seasonAirDate) ? seasonAirDate : null,
      episode_count: details.episodes.length,
      id: +details.id,
      name: details.name,
      overview: details.overview,
      season_number: details.season_number,
      episodes: episodes,
    }

    console.log("update", season);

    const existingSeason = tvShow.seasons.find((e) => e.season_number === seasonNumber);
    if (existingSeason) {
      existingSeason.episodes = episodes;
    } else {
      tvShow.seasons.push(season);
    }
    tvShow.save();
    

    /*
    const result = await TvShow.findOneAndUpdate(
      {
        'tmdb_id': tvShowId.toString(),
        'seasons.season_number': seasonNumber,
      },
      {
        $set: {
          'seasons.$.air_date': season.air_date,
          'seasons.$.episode_count': season.episode_count,
          'seasons.$.id': season.id,
          'seasons.$.name': season.name,
          'seasons.$.overview': season.overview,
          'seasons.$.season_number': season.season_number, 
          'seasons.$.episodes': season.episodes,                                                    
        }
      },
      { new: true }
    )
    */

    console.log("updateSeason -> finished");    
  }

  async handleTvShows(tvShowIds: number[]) {
    console.log("tmdb -> handleTvShows", tvShowIds);

    const ret = { name: '', year: '', popularity: 0 }

    for (const tvShowId of tvShowIds) {
      console.log("looking for tvShow", tvShowId);
      const url = `${this.BASE_URL}tv/${tvShowId}?api_key=${this.token}&append_to_response=watch/providers,videos,external_ids`
      const resp = await axios.get<ITvShow>(url);
      const details = resp.data;

      console.log("details", details)

      // external ids: only IMDB
      const ids: {name: string, id: string}[] = [];
      if (details.external_ids?.imdb_id) ids.push({name: 'imdb', id: details.external_ids?.imdb_id})

      console.log("WPS", this.WATCH_PROVIDERS_TV);
      // watch/providers
      const watch_providers = [];
      for (const [iso_3166_1, data] of Object.entries(details['watch/providers'].results)) {
        for (const [type, providers] of Object.entries(data as object)) {
          if (type !== 'link') {
            for (const provider of providers) {
              const entry = {iso_3166_1, watch_provider: this.WATCH_PROVIDERS_TV.get(provider.provider_id), type};

              const found = await WatchProvider.findOne({'_id': entry.watch_provider});
              if (found) {
                console.log('yay', provider.provider_id)
              } else {
                console.log('nay', provider.provider_id);
              }
              console.log("entry", entry);
              watch_providers.push(entry);
            }
          }
        }
      }

      console.log("watch providers", watch_providers)

      // dates
      const firstAirDate = parseISO(details.first_air_date);
      const lastAirDate = parseISO(details.last_air_date);

      // seasons

      const seasons = details.seasons.map((e: {
        air_date?: string,
        episode_count: number,
        id: number, 
        name: string,
        overview: string,
        poster_path: string,
        season_number: number,
      }) => ({...e, air_date: (e.air_date? parseISO(e.air_date) : null)}));
 
      const update = {
        first_air_date: firstAirDate,
        homepage: details.homepage,   
        tmdb_id: details.id,    
        in_production: details.in_production,
        last_air_date: isValid(lastAirDate) ? lastAirDate: null,
        name: details.name,
        number_of_seasons: details.number_of_seasons,
        number_of_episodes: details.number_of_episodes,        
        overview: details.overview,
        popularity: details.popularity,        
        status: details.status,        
        tagline: details.tagline,
        genres: details.genres.map((e) => e.name),
        external_ids: ids,
        videos: details.videos?.results,
        watch_providers: watch_providers,        
      }

      console.log("update", update);

      if (details.popularity > ret.popularity) {
        ret.name = details.name;
        ret.year = getYear(firstAirDate).toString();
        ret.popularity = details.popularity;
      }

      const doc = await TvShow.findOneAndUpdate({'tmdb_id': details.id.toString()}, {$set: update}, {
        upsert: true,
        new: true,
      });
      console.log("doc", doc);

      // update season data
      for (const season of seasons.filter((e) => e.season_number >= 1)) {
        await this.updateSeason(tvShowId, season.season_number);
      }

      if (details.poster_path)
        await this.downloadImage(`${this.IMAGE_BASE_URL}${this.IMAGE_POSTER_SIZE}${details.poster_path}`, this.POSTER_PATH, doc._id);

    }

    console.log("returning", ret);
    
    return ret;
  }

  async getWatchProviders() {
    console.log('getWatchProviders');

    const types = ['movie', 'tv'];

    for (const type of types) {
      const url = `${this.BASE_URL}watch/providers/${type}?api_key=${this.token}`

      const resp = await axios.get<IWatchProviders>(url);
  
      if (resp) {
        for (const result of resp.data.results) {
          const doc = await WatchProvider.findOneAndUpdate(
            { 'provider_id': result.provider_id, 'type': type },
            { $set: result },
            { upsert: true, new: true }
          );
          if (doc._id)
            await this.downloadImage(`${this.IMAGE_BASE_URL}${this.IMAGE_LOGO_SIZE}${result.logo_path}`, this.LOGO_PATH, doc._id);           
        }
      }
    }
  }

  async downloadImage(from: string, to: string, id: string) {
    const writer = createWriteStream(`${to}${id}.jpg`);
    axios({
      url: from,
      method: 'GET',
      responseType: 'stream',
    }).then(response => {
      response.data.pipe(writer);
      console.log('image download successful', to, id);
    });
  }
  
}

export default TMDB;
