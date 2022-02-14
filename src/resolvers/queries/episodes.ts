import { Types } from "mongoose";
import { TvShow } from "../../schema/TvShow";
import { IContext } from "../../schema/types";
import { User } from "../../schema/User";

interface IArgs {
  tvShowId: string;
  season: number;
  salt: string;
}

export default async function episodes({tvShowId, season}: IArgs, context: IContext) { 
  const tid = new Types.ObjectId(tvShowId);
  
  const user = await User.findOne({'_id': context.user?._id});

  const tvShow = await TvShow.findById(tid).lean();

  if (tvShow) {
    return tvShow.seasons.find((e) => e.season_number === season)?.episodes.map((episode) => {
      const watched_gql = user?.watched.find((e) => e.episodes?.includes(episode.id)) !== undefined;
      console.log("watched", watched_gql);
      return {...episode, watched_gql: watched_gql}
    });
  }

  return;
}