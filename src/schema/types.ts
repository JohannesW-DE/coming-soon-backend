import { Types } from "mongoose";

interface IVideo {
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
}

interface IMovieRelease {
  iso_3166_1: string;
  certification: string;
  iso_639_1: string;
  note: string;
  release_date: Date;
  type: number;
}

// 29/12 10:42
interface IMongoMovie {
  _id: Types.ObjectId;
  tmdb_id: string;
  title: string;
  overview: string;
  tagline: string;
  status: string;
  year: number;
  runtime: number;
  popularity: number;
  release_date: Date;
  homepage: string;

  genres: Array<string>;

  external_ids: [{
    name: string;
    id: string;
  }];

  videos: Array<IVideo>;

  release_dates: Array<IMovieRelease>;

  watch_providers: [{
    iso_3166_1: string; 
    watch_provider: Types.ObjectId;
    type: string;
  }]

  watch_providers_gql?: Array<{
    logo: string;
    display_priority: number;
    iso_3166_1: string;
    name: string;
    type: string;
  }>

  watched_gql?: boolean;

  created_at: Date; 
  updated_at: Date;     
}


export interface IEpisode {
  id: number;
  air_date: Date | null;
  episode_number: number;
  name: string;
  overview: string;
  production_code: string;
  season_number: number;

  watched_gql?: boolean;
}

// 29/12 14:09
interface IMongoTvShow {
  _id: Types.ObjectId;
  first_air_date: Date;
  homepage: string; 
  tmdb_id: string;
  in_production: boolean;
  last_air_date: Date;
  name: string;
  number_of_episodes: number;
  number_of_seasons: number;
  overview: string;
  popularity: number; 
  status: string;   
  tagline: string;

  seasons: ISeason[]

  genres: Array<string>;

  external_ids: [{
    name: string;
    id: string;
  }];

  videos: Array<IVideo>;

  watch_providers: [{
    iso_3166_1: string; 
    watch_provider: Types.ObjectId;
    type: string;
  }]

  watch_providers_gql?: Array<{
    logo: string;
    display_priority: number;
    iso_3166_1: string;
    name: string;
    type: string;
  }>

  created_at: Date; 
  updated_at: Date;  
}

interface ISeason {
  air_date: Date | null;
  id: number;
  episode_count: number;
  name: string;
  overview: string;
  season_number: number;

  episodes: IEpisode[];

  last_episode?: IEpisode;
  next_episode?: IEpisode;
}

/**
 * list
 */

interface IListMovie {
  movie: IMongoMovie;
  comment?: string;
  position?: number;
  added_at: Date;
}

interface IListTvShow {
  tv_show: IMongoTvShow;
  comment?: string;
  position?: number;
  season: number;
  added_at: Date;
}

interface IBookmark {
  list: IMongoList;
  comment?: string;
  position?: number;
  added_at: Date;
  favourite?: boolean;  
  own?: boolean;
}

interface IMongoList {
  is_public: boolean
  owner: IUser
  name: string
  description: string
  url: string
  entries: IEntry[]
  created_at: Date; 
  updated_at: Date;
}

interface IEntry {
  _id: Types.ObjectId;  
  tv_show?: IMongoTvShow;
  movie?: IMongoMovie;
  comment?: string;
  position?: number;
  season?: number;
  added_at: Date;
}

interface IUser {
  _id: Types.ObjectId;  
  username?: string;
  google_id?: string;
  twitter_id?: string;
  github_id?: string;
  email: string;
  bookmarks?: IBookmark[];
  watched: IWatched[];
  settings: ISetting[];
}

interface ISetting {
  key: string;
  value: string;
  values: string[];
}

interface IWatched {
  tv_show?: IMongoTvShow;
  movie?: IMongoMovie;
  episodes?: number[];
}

/**
 * watch provider
 */

interface IWatchProvider {
  _id: Types.ObjectId;
  display_priority: number;
  provider_name: string;  
  provider_id: number;
  type: string;
}

/**
 * 
 */
interface IContext {
  user?: IUser,
}

export {
  IMovieRelease,
  IListMovie,
  IMongoMovie,
  IMongoTvShow,
  IVideo,
  IMongoList,
  IUser,
  IEntry,
  ISeason,
  IWatchProvider,
  IBookmark,
  IContext,
  IWatched,
  ISetting,
}
