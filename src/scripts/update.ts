import { sub } from "date-fns";
import { connect, connection } from "mongoose";
import TMDB from "../extras/tmdb";
import { extractIMDB } from "../helpers";
import { Movie } from "../schema/Movie";
import { TvShow } from "../schema/TvShow";
import { ok } from "assert";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

ok(process.env.MONGODB_URI);
connect(process.env.MONGODB_URI);

ok(process.env.TMDB_TOKEN);
const tmdb = new TMDB(process.env.TMDB_TOKEN);

const updateMovies = async (days: number) => {
  console.log("update movies");
  const limit = sub(new Date(), {days: days});
  const movies = await Movie.find({'updated_at': {$lte: limit}});
  for (const movie of movies) {
    console.log('updating: ', movie.title);
    await tmdb.handleMovies([+movie.tmdb_id]);
    //break;
  }
}

const updateTvShows = async (days: number) => {
  console.log("update tv shows");
  const limit = sub(new Date(), {days: days});
  //const tvShows = await TvShow.find({'name': 'The Expanse'});
  const tvShows = await TvShow.find({'updated_at': {$lte: limit}});
  for (const tvShow of tvShows) {
    console.log('updating: ', tvShow.name);
    const lastSeason = tvShow.seasons.sort((a, b) => a.season_number > b.season_number ? 1 : -1).pop();
    if (lastSeason) {
      console.log("last season", lastSeason);
      await tmdb.updateSeason(+tvShow.tmdb_id, lastSeason.season_number)
    }
    //break;
  }
}

connection.on('error', (error) => {
  console.log('failed to connect to database', error);
  process.exit(1);
})

connection.once('open', async () => {
  console.log("status: db connection open")

  await tmdb.populateWatchProviders();

  if (process.argv.length !== 4) {
    console.log(`error: expected 2 arguments - the number of days since the last update for movies and tv shows to be included respectively`); 
    process.exit(1);
  }

  const moviesAfterDays = process.argv[2];
  if (!Number.isInteger(+moviesAfterDays)) {
    console.log(`error: invalid first argument (${moviesAfterDays}); integer expected`);
    process.exit(1);
  }

  const tvShowsAfterDays = process.argv[3];
  if (!Number.isInteger(+tvShowsAfterDays)) {
    console.log(`error: invalid second argument (${tvShowsAfterDays}); integer expected`);
    process.exit(1);
  }

  await updateMovies(+moviesAfterDays);
  console.log("status: finished updating movies")

  await updateTvShows(+tvShowsAfterDays);
  console.log("status: finished updating days")

  process.exit(0);
});
