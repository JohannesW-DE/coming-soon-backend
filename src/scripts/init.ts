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
  console.log('failed to connect to database', error);
  
  process.exit(1);
})

connection.once('open', async () => {
  console.log("status: db connection open")

  await tmdb.getWatchProviders();

  process.exit(0);
});
