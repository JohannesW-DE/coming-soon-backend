import { Types } from "mongoose";
import { List } from "../../schema/List";
import { User } from "../../schema/User";
import { IContext, IEntry, IEpisode } from "../../schema/types";
import { WatchProvider } from "../../schema/WatchProvider";

import { isBefore, isAfter, getUnixTime } from 'date-fns';

interface IArgs {
  id: string;
}

export default async function list({id}: IArgs, context: IContext) {
  const lid = new Types.ObjectId(id)

  const list = await List.findOne({_id: lid}).lean().populate("entries.movie").populate("entries.tv_show").populate("owner").populate({path: 'entries.tv_show.watch_providers.watch_provider', model: 'WatchProvider'});
  if (!list) {
    return;
  }


  if (!list.is_public) {
    console.log("list -> list is NOT public")
    if (!context.user) {
      console.log("list -> no context.user")
      return;
    }
    if (!list.owner._id.equals(context.user._id)) { // !
      console.log("list -> context.user, but differend id")
      return;
    }
    console.log("list -> but access is allowed")
  }

  const user = await User.findOne({'_id': context.user?._id});
  

  let nextEpisode: IEpisode | null = null;
  let lastEpisode: IEpisode | null = null;

  const updatedEntries: Array<IEntry> = [];

  let countries: string[] = ['US'];
  const countrySetting = user?.settings.find((e) => e.key === 'countries')?.values  
  if (countrySetting) {
    countries = countrySetting
  }

  for (const entry of list.entries) {
    if (entry.tv_show) {
      // update next and last episode
      nextEpisode = null;
      lastEpisode = null;      

      console.log("handling", entry.tv_show.name);
      // update watch providers
      const ids = entry.tv_show.watch_providers.map((e) => e.watch_provider._id);

      const watchProviders = await WatchProvider.find({'_id': {$in : ids}}).lean();

      console.log("start wp");

      entry.tv_show.watch_providers_gql = entry.tv_show.watch_providers.filter((provider) => countries.includes(provider.iso_3166_1)).map((provider) => {
        const display_priority = watchProviders.find((p) => p._id.equals(provider.watch_provider))?.display_priority;
        const name = watchProviders.find((p) => p._id.equals(provider.watch_provider))?.provider_name;
        return ({
          'logo': provider.watch_provider.toString(),
          iso_3166_1: provider.iso_3166_1,
          name: name ? name : '',
          type: provider.type,
          display_priority: display_priority ? display_priority : -1
        });
      });


      const season = entry.tv_show.seasons.find((season) => season.season_number === entry.season);
      console.log("season", season);
      const episodes = season?.episodes.sort((a, b) => {
        return a.episode_number > b.episode_number ? 1 : -1;
      }); // TS
      console.log("episodes", episodes);

      const today = new Date();
      const initialEpisodes: IEpisode[] = [];
      episodes?.forEach((episode) => {
        if (episode.air_date && isBefore(episode.air_date, today)) {
          lastEpisode = episode;
          if (user) {          
            lastEpisode.watched_gql = user.watched.find((e) => e.episodes?.includes(episode.id)) !== undefined;            
          }
        } else if (!nextEpisode && episode.air_date && isAfter(episode.air_date, today)) {
          nextEpisode = episode;
          if (user) {
            nextEpisode.watched_gql = user.watched.find((e) => e.episodes?.includes(episode.id)) !== undefined;  
          }          
        }
      })
      if (season) {
        if (lastEpisode) {
          initialEpisodes.push(lastEpisode);
        }
        if (nextEpisode) {
          initialEpisodes.push(nextEpisode);
        }
        season.episodes = initialEpisodes;
      }
      console.log("handled", entry.tv_show.name);
    }
    if (entry.movie) {
      // update watch providers
      const ids = entry.movie.watch_providers.map((e) => e.watch_provider._id);

      const watchProviders = await WatchProvider.find({'_id': {$in : ids}}).lean();

      entry.movie.watch_providers_gql = entry.movie.watch_providers.filter((provider) => countries.includes(provider.iso_3166_1)).map((provider) => {
        const display_priority = watchProviders.find((p) => p._id.equals(provider.watch_provider))?.display_priority;
        const name = watchProviders.find((p) => p._id.equals(provider.watch_provider))?.provider_name;
        return ({
          'logo': provider.watch_provider.toString(),
          iso_3166_1: provider.iso_3166_1,
          name: name ? name : '', 
          type: provider.type,
          display_priority: display_priority ? display_priority : -1
        });
      });

      // update release dates

      entry.movie.release_dates = entry.movie.release_dates.filter((e) => countries.includes(e.iso_3166_1) && e.type === 3)

      if (user) {
        entry.movie.watched_gql = user.watched.find((e) => entry.movie && e.movie?._id.equals(entry.movie._id)) !== undefined;  
      }
    }

    updatedEntries.push(entry);
  }

  list.entries = updatedEntries;
  //console.log('list.entries',list.entries );

  //console.log("returning list", list);

  return list;
}