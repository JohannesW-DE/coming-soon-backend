import { extractIMDB } from "../../helpers";
import { Movie } from "../../schema/Movie";
import { TvShow } from "../../schema/TvShow";
import { IMongoMovie, IMongoTvShow } from "../../schema/types";

export default async function suggestions(args: {query: string}) {
  const minLength = 3;

  if (args.query.length < minLength) {
    console.log(`returning, length < ${minLength}`);
    return;
  }

  console.log('suggestions -> args: ', args)

  const result: {tvShows?: IMongoTvShow[], movies?: IMongoMovie[]} = {};

  // two-step-search for imdb id (candidate, actual id)
  if (args.query.includes('imdb')) {
    const id = extractIMDB(args.query);
    if (id) {
      const movies = await Movie.find({'external_ids': {$elemMatch: {'name': 'imdb', 'id': id }}});
      result.movies = movies;

      const tvShows = await TvShow.find({'external_ids': {$elemMatch: {'name': 'imdb', 'id': id }}});
      result.tvShows = tvShows;

      console.log("result (via imdb id)", result);

      return result;
    }
  }

  // look for movies
  const movies = await Movie.find({'title': { $regex: args.query, $options: 'i' }}).sort('popularity');
  result.movies = movies;

  // look for tv shows
  const tvShows = await TvShow.find({'name': { $regex: args.query, $options: 'i' }}).sort('popularity');
  result.tvShows = tvShows;

  console.log("result", result);

  return result;
}