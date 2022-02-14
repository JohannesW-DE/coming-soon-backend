import { Types } from "mongoose";
import { Movie } from "../../schema/Movie";
import { TvShow } from "../../schema/TvShow";
import { IContext, IWatched } from "../../schema/types";
import { User } from "../../schema/User";

interface IArgs {
  movieId?: string;
  tvShowId?: string;
  episode?: number;
  watched: boolean;
}

export default async function updateWatched({movieId, tvShowId, episode, watched}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("updateWatched -> no user found in context");
    return false;
  }

  console.log('updateWatched', movieId, tvShowId, episode, watched);

  const user = await User.findOne({'_id': context.user._id});
  if (!user) {
    return false;
  }

  if (tvShowId && episode) {
    const tid = new Types.ObjectId(tvShowId);
    const entry = user.watched.find((e) => e.tv_show?._id.equals(tid));
    if (entry) {
      if (watched) {
        const oldOnes = entry?.episodes ? entry.episodes : [];
        const episodes = [...new Set([...oldOnes, episode])];
        entry.episodes = episodes;
      } else {
        entry.episodes = entry.episodes?.filter((e) => e !== episode);
      }
    } else {
      const tvShow = await TvShow.findOne({'_id': tid}); // findOne !!!!!
      if (tvShow && watched) {
        user.watched.push({tv_show: tvShow, episodes: [episode]});
      }
    }
  } else if (movieId) {
    const mid = new Types.ObjectId(movieId);    
    if (!watched) {
      user.watched = user.watched.filter((e) => !e.movie?._id.equals(mid));
    } else {
      const entry = user.watched.find((e) => e.movie?._id.equals(mid));
      if (!entry) {
        const movie = await Movie.findOne({'_id': mid});
        if (movie) {   
          user.watched.push({movie: movie});  
        }
      }
    }
  }

  user.save();

  return true;
}
