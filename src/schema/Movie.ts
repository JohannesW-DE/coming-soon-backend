import { model, Schema } from "mongoose";
import { IMongoMovie } from "./types";


const movieSchema = new Schema<IMongoMovie>({
  tmdb_id: String,
  title: String,
  overview: String,
  tagline: String,
  status: String,
  year: Number,
  runtime: Number,
  popularity: Number,
  release_date: Date,
  homepage: String,

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

  release_dates: [{
    _id: false,
    iso_3166_1: String,
    certification: String,
    iso_639_1: String,
    note: String,
    release_date: Date,
    type: {
      type: Number
    },
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
export const Movie = model('Movie', movieSchema, 'movie');