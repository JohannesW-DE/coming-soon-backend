import { fromUnixTime } from "date-fns";
import { Types } from "mongoose";
import { List } from "../../schema/List";
import { Movie } from "../../schema/Movie";
import { TvShow } from "../../schema/TvShow";
import { IContext, IEntry, IEpisode, IMongoMovie, IMongoTvShow } from "../../schema/types";
import { User } from "../../schema/User";

interface IArgs {
  from: string;
  to: string;
}

export default async function comingSoon({from, to}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("comingSoon -> no user found in context");
    return false;
  }

  // from & to are in seconds!
  const fromDate = fromUnixTime(+from);
  const toDate = fromUnixTime(+to);

  const tvShows: Types.ObjectId[] = [];
  const movies: Types.ObjectId[] = [];

  const user = await User.findOne({'_id': context.user._id});
  if (!user) {
    return false;
  }
  
  const lists = await List.find({ owner: user }).lean();
  lists
    .flatMap((list) => list.entries)
    .filter((entry: IEntry) => entry !== undefined)
    .forEach((entry: IEntry) => {
      if (entry.tv_show) {
        tvShows.push(entry.tv_show._id)
      } else if (entry.movie) {
        movies.push(entry.movie._id);
      }
  });

  const tvShowList = await TvShow.find({
    $and: [
      { '_id': {$in: tvShows}},
      { 'seasons.episodes': {
        $elemMatch: {
          'air_date': {
            $gte: fromDate,
            $lte: toDate,            
          }
        }
      }}
    ]
  }).lean()

  const movieList = await Movie.find({
    $and: [
      { '_id': {$in: movies}},
      { 'release_date': {
        $gte: fromDate,
        $lte: toDate,
      }}
    ]
  }).lean()

  const result: {episode?: IEpisode, tv_show?: IMongoTvShow, movie?: IMongoMovie}[] = [];

  tvShowList.forEach((tvShow) => {
    tvShow.seasons.forEach((season) => {
      season.episodes.filter((episode => {
        if (!episode.air_date) {
          return false;
        }
        return episode.air_date > fromDate && episode.air_date < toDate;
      })).forEach((episode) => {
        episode.watched_gql = user.watched.find((e) => e.episodes?.includes(episode.id)) !== undefined;
        result.push({episode, tv_show: tvShow});
      });
    });
  })

  movieList.forEach((movie) => {
    movie.watched_gql = user.watched.find((e) => e.movie?._id.equals(movie._id)) !== undefined;    
    result.push(({movie: movie}));
  })

  console.log("result", {from: from, to: to, matches: result});

  return {from: from, to: to, matches: result};
}
