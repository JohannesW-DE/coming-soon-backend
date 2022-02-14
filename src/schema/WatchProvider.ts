import { model, Schema, Types } from "mongoose";
import { IUser, IWatchProvider } from "./types";

const watchProviderSchema = new Schema<IWatchProvider>({
  display_priority: Number,
  provider_name: String,  
  provider_id: Number,  
  type: String,
});

export const WatchProvider = model('WatchProvider', watchProviderSchema, 'watch_provider');