export interface ITvShow {
  backdrop_path?: string;
  created_by: [{
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path?: string;
  }];
  episode_run_time: [number];
  first_air_date: string;
  genres: [{
    id: number;
    name: string;
  }];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: [string];
  last_air_date: string;
  last_episode_to_air: {
    air_date: string;
    epsiode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path?: string;
    vote_average: number;
    vote_count: number;
  };
  name: string;
  next_episode_to_air: null;
  networks: [{
    name: string;
    id: number;
    logo_path?: string;
    origin_country: string;
  }];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: [string];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path?: string;
  production_companies: [{
    id: number;
    logo_path?: string;
    name: string;
    origin_country: string;
  }];
  production_countries: [{
    iso_3166_1: number;
    name: string;
  }];
  seasons: [{
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
  }];
  spoken_languages: [{
    english_name: string;
    iso_639_1: string;
    name: string;
  }];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;

  external_ids?: IMovieExternalIds;  
  videos?: IMovieVideos; 
   
  'watch/providers': any;  
}

export interface ISeason {
  _id: string;
  air_date: string | null;
  episodes: [{
    air_date: string | null;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path: string;
    vote_average: number;
    vote_count: number;
  }];
  name: string;
  overview: string;
  id: string;
  poster_path?: string;
  season_number: number;
}

export interface IMovie {
  adult: boolean;
  backdrop_path?: string;
  budget: number;
  genres: [{
    id: number;
    name: string;
  }];
  homepage?: string;
  id: number;
  imdb_id?: string;
  original_language: string;
  original_title: string;
  overview?: string;
  popularity: number;
  poster_path?: string;
  production_companies: [{
    name: string;
    id: number;
    logo_path?: string;
    origina_country: string;
  }];
  production_countries: [{
    iso_3166_1: string;
    name: string;
  }];
  release_date: string;
  revenue: number;
  runtime?: number;
  spoken_languages: [{
    iso_639_1: string;
    name: string;
  }];
  status: string;
  tagline?: string;
  title: string;
  video: string;
  vote_average: number;
  vote_count: number;

  external_ids?: IMovieExternalIds;
  release_dates?: IMovieReleaseDates;
  videos?: IMovieVideos;

  'watch/providers': any;
}

export interface IMultiSearchMovie {
  poster_path?: string;
  adult: boolean;
  overview: string;
  release_date: string;
  original_title: string;
  genres_ids: number[];
  id: number;
  media_type: string;
  original_language: string;
  title: string;
  backdrop_path?: string;
  popularity: number;
  vote_count: number;
  video: boolean;
  vote_average: number;
}

export interface IMultiSearchTv {
  poster_path?: string;
  popularity: number; 
  id: number;
  overview: string;
  backdrop_path?: string; 
  vote_average: number;   
  media_type: string;
  first_air_date: string;
  origin_country: string[]; 
  genres_ids: number[];
  original_language: string;
  vote_count: number;
  name: string;
  original_name: string;
}

export interface IMultiSearch {
  page: number;
  results: (IMultiSearchMovie|IMultiSearchTv)[]
  total_results: number;
  total_pages: number;
}

export interface IMovieVideos {
  id?: number
  results: [{
    iso_639_1: string;
    iso_3166_1: string;
    name: string;
    key: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
    id: string;
  }];
}

export interface IMovieExternalIds {
  imdb_id?: string;
  facebook_id?: string;
  instagram_id?: string;
  twitter_id?: string;
  id?: number
}

export interface IMovieReleaseDates {
  id?: number;
  results: [{
    iso_3166_1: string;
    release_dates: [{
      certification: string;
      iso_639_1: string;
      release_date: string;
      type: number;
      note: string;
    }]
  }]
}

export interface IFind {
  movie_results: IMultiSearchMovie[];
  tv_results: IMultiSearchTv[];
}

export interface IWatchProvider {
  display_priority: number;
  logo_path: string;
  provider_name: string;
  provider_id: number;
}

export interface IWatchProviders {
  results: IWatchProvider[];
}