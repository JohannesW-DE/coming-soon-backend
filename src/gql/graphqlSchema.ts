import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type List {
    _id: ID!    
    created_at: String!
    updated_at: String!
    is_public: Boolean
    owner: User
    name: String!
    description: String
    url: String
    entries: [Entry!]
  }

  type Entry {
    _id: ID!    
    movie: Movie
    tv_show: TvShow
    comment: String
    position: Int
    season: Int
    added_at: String
  }

  type WatchProvider {
    logo: String
    display_priority: String
    iso_3166_1: String    
    name: String
    type: String
  }

  type Movie {
    _id: ID!
    tmdb_id: String!
    title: String!
    overview: String
    year: Int
    genres: [String]
    tagline: String
    popularity: Float    
    release_date: String
    release_dates: [ReleaseDate]
    included: Boolean
    videos: [Video]
    external_ids: [ExternalId]   
    watch_providers_gql: [WatchProvider]
    watched_gql: Boolean
  }

  type ReleaseDate {
    iso_3166_1: String
    release_date: String
    type: Int
  }

  type Video {
    iso_639_1: String
    iso_3166_1: String
    name: String
    key: String
    site: String
    size: Int
    type: String
    official: Boolean
    published_at: String
  }

  type Season {
    name: String
    air_date: String
    episode_count: Int
    season_number: Int
    episodes: [Episode]
  }

  type ExternalId {
    name: String!
    id: String!
  }

  type TvShow {
    _id: ID!
    tmdb_id: String!    
    name: String!
    overview: String
    first_air_date: String
    genres: [String]    
    year: Int
    popularity: Float
    tagline: String
    current_season_start_date: String
    seasons: [Season]
    videos: [Video]
    external_ids: [ExternalId]
    watch_providers_gql: [WatchProvider]
  }

  type ListMovie {
    movie: Movie
    comment: String
    position: Int
    added_at: String
  }

  type ListTvShow {
    tv_show: TvShow
    comment: String
    position: Int
    season: Int
    season_air_date: String
    added_at: String
  }

  type SearchForMovieResult {
    success: Boolean!
    movie: Movie
  }

  type SearchForTvShowResult {
    success: Boolean!
    show: TvShow
  }

  type Bookmark {
    list: List
    comment: String
    position: Int
    added_at: String
    favourite: Boolean
    own: Boolean
  }

  type User {
    _id: ID!
    username: String
    email: String
    lists: [List!]
    bookmarks: [Bookmark!]
    settings: [Setting]
  }

  type Setting {
    key: String!
    value: String
    values: [String]
  }

  type MultiSearchResult {
    query: String
    name: String
    year: String
    count: Int
  }

  type SuggestionsResult {
    movies: [Movie]
    tvShows: [TvShow] 
  }

  type ListedResult {
    movies: [Movie]
    tvShows: [TvShow]
  }

  type Episode {
    id: Int
    season_number: Int
    episode_number: Int
    air_date: String
    name: String
    overview: String
    watched_gql: Boolean    
  }

  type TvShowResult {
    episodes: [Episode]
  }

  type ListsResult {
    _id: ID!    
    created: String
    modified: String
    is_public: Boolean
    owner: User
    name: String!
    description: String
    url: String
    numberOfMovies: Int
    numberOfTvShows: Int
  }

  type ComingSoonResult {
    from: String
    to: String
    matches: [ComingSoonMatch]
  }

  type ComingSoonMatch {
    episode: Episode
    tv_show: TvShow
    movie: Movie
  }

  type Query {
    list(id: ID!): List
    listAsComparison(id: ID!): List
    currentUser: User
    multiSearch(query: String): MultiSearchResult
    suggestions(query: String): SuggestionsResult
    listed(listId: ID!): ListedResult
    episodes(tvShowId: ID!, season: Int): [Episode]
    lists: [ListsResult]
    comingSoon(from: String!, to: String!): ComingSoonResult!
  }

  input SettingInput {
    key: String!
    value: String
    values: [String]
  }

  type Mutation {
    addMovieToList(listId: ID!, movieId: ID!): Boolean
    removeEntryFromList(listId: ID!, entryId: ID!): Boolean
    addTvShowToList(listId: ID!, tvShowId: ID!, seasonNumber: Int): Boolean
    createList(name: String!, description: String, isPublic: Boolean, url: String): String
    deleteList(id: ID!): Boolean    
    updateListDetails(id: ID!, name: String, description: String, isPublic: Boolean, url: String): Boolean
    updatePositions(listId: ID!, ids: [String]): Boolean
    updateComment(listId: ID!, entryId: ID!, comment: String): Boolean
    updateBookmark(listId: ID!, bookmarked: Boolean): Boolean
    updateWatched(movieId: ID, tvShowId: ID, episode: Int, watched: Boolean): Boolean
    updateFavouriteStatus(listId: ID!, favourite: Boolean): Boolean
    updateAccount(username: String, settings: [SettingInput]): Boolean
    deleteAccount: Boolean
  }
`);