// extract imdb link
export function extractIMDB(text: string) {
  const imdbRx = /(?<imdb_id>tt\d+)\/?/;

  const imdbResult = imdbRx.exec(text);
  if (imdbResult?.groups) {
    return imdbResult.groups.imdb_id;
  } else {
    return null;
  }
}

// extract tmdb link
export function extractTMDB(text: string) {
  const tmdbRx = /themoviedb\.org\/(?<type>tv|movie)\/(?<tmdb_id>\d+)+/;

  const tmdbResult = tmdbRx.exec(text);
  if (tmdbResult?.groups) {
    return {type: tmdbResult.groups.type, id: tmdbResult.groups.tmdb_id};
  } else {
    return null;
  }
}