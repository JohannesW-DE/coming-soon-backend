import { model, Schema, Types } from "mongoose";
import { IUser } from "./types";

const userSchema = new Schema<IUser>({
  username: String,
  google_id: String,
  twitter_id: String,
  github_id: String,
  email: String,
  bookmarks: [{
    _id: false,
    list: { type: Schema.Types.ObjectId, ref: 'List'},
    added_at: Date,
    favourite: Boolean,
    own: Boolean,
  }],
  watched: [{
    _id: false,    
    tv_show: { type: Schema.Types.ObjectId, ref: 'TvShow', required: false},
    movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: false},
    episodes: [Number],
  }],
  settings: [{
    _id: false,     
    key: String,
    value: String,
    values: [String],
  }]
});

export const User = model('User', userSchema, 'user');