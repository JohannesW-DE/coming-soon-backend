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

connection.on('error', (error) => {
  console.log('error: failed to connect to database', error);
  process.exit(1);
})

connection.once('open', async () => {
  console.log("status: db connection open")

  const mediaType = process.argv[2];
  if (mediaType !== 'movie' && mediaType !== 'tv') {
    console.log(`error: invalid first argument (${mediaType}); valid are 'movie' or 'tv'`);
    process.exit(1);
  }

  const timeWindow = process.argv[3];
  if (timeWindow !== 'week' && timeWindow !== 'day') {
    console.log(`error: invalid first argument (${timeWindow}); valid are 'week' or 'day'`);
    process.exit(1);
  }

  console.log("status: querying")

  await tmdb.getTrending(mediaType, timeWindow);

  console.log("status: success")

  process.exit(0);
});
