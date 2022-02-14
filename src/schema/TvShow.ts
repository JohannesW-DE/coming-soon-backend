import { model, Schema, Types } from "mongoose";
import { IMongoTvShow, IVideo } from "./types";



const tvShowSchema = new Schema<IMongoTvShow>({
  first_air_date: Date,
  homepage: String,
  tmdb_id: String,
  in_production: Boolean,
  last_air_date: Date,
  name: String,
  number_of_episodes: Number,
  number_of_seasons: Number,
  overview: String,
  popularity: Number,
  status: String,  
  tagline: String,

  seasons: [{
    _id: false,    
    air_date: Date,
    id: Number,
    episode_count: Number,
    name: String,
    overview: String,
    season_number: Number,
    episodes: [{
      _id: false,
      id: Number,
      air_date: Date,
      episode_number: Number,
      name: String,
      overview: String,
      production_code: String,
      season_number: Number,
    }]
  }],

  genres: [String],

  external_ids: [{
    _id: false,    
    name: String,
    id: String,
  }],

  videos: [{
    _id: false,
    iso_639_1: String,
    iso_3166_1: String,
    name: String,
    key: String,
    site: String,
    size: Number,
    type: {
      type: String
    },
    official: Boolean,
    published_at: String,
  }],

  watch_providers: [{
    _id: false,
    iso_3166_1: String,
    watch_provider: { type: Schema.Types.ObjectId, ref: 'WatchProvider', required: false },
    type: {
      type: String
    },
  }],

  created_at: Date,
  updated_at: Date,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const TvShow = model('TvShow', tvShowSchema, 'tv');

