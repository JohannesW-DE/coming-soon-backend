import { Types } from "mongoose";
import { List } from "../../schema/List";
import { Movie } from "../../schema/Movie";
import { IContext } from "../../schema/types";

interface IArgs {
  listId: string;
  movieId: string;
}

export default async function addMovieToList({listId, movieId}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("addMovieToList -> no user found in context");
    return false;
  }
  
  const lid = new Types.ObjectId(listId);
  const mid = new Types.ObjectId(movieId);
  
  const list = await List.findOne({'_id': lid});
  const movie = await Movie.findOne({'_id': mid});

  if (list && list.owner._id.equals(context.user._id) && movie) {
    if (!list.entries.some((e) => e.movie && e.movie._id.equals(mid))) {
      const entry = {movie: movie, added_at: new Date()};
      await List.updateOne({'_id': lid}, { $push: { entries: entry }})
      return true;
    }
  }

  return false;
}