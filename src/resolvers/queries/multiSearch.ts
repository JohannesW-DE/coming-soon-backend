import TMDB from "../../extras/tmdb";
import { extractIMDB, extractTMDB } from "../../helpers";

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export default async function multiSearch(args: any) {
  const { query }: { query: string } = args;

  console.log("multiSearch", query);

  if (query === '') {
    return;
  }

  const token = process.env.TMDB_TOKEN;
  /*
  const promise = new Promise((res, rej) => {
      setTimeout(() => res("Now it's done!"), 2000)
  });

  const p = await promise; 
  */
  if (token) {
    const tmdb = new TMDB(token);
    await tmdb.populateWatchProviders();
    if (query.includes('imdb')) {
      const id = extractIMDB(query);
      if (id) {
        const result = await tmdb.searchIMDB(id);
        return result;        
      }
    } else if (query.includes('themoviedb')) {
      const extracted = extractTMDB(query);
      if (extracted) {
        const result = await tmdb.searchTMDB(extracted.type, extracted.id);
        return result;
      }
    } else {
      const result = await tmdb.search(query);
      return result;
    }
  } else {
    return;
  }
}
