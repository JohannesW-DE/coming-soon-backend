import { model, Schema } from "mongoose";

import { IMongoList } from './types'

const listSchema = new Schema<IMongoList>({
  is_public: Boolean,
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
  description: String,
  url: String,
  entries: [{
    tv_show: { type: Schema.Types.ObjectId, ref: 'TvShow', required: false },
    movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: false },
    comment: String,
    season: Number,
    position: Number,
    added_at: Date,
  }],
  created_at: Date,
  updated_at: Date,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
export const List = model('List', listSchema, 'list');
