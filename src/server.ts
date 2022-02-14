/* eslint-disable @typescript-eslint/no-var-requires */
import express from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import { graphqlHTTP } from "express-graphql";
import { connect, Types, set, connection } from "mongoose";
import { schema } from "./gql/graphqlSchema";
import { Movie } from "./schema/Movie";
import { List } from "./schema/List";
import { User } from "./schema/User";
import { TvShow } from "./schema/TvShow";
import passport from "passport";

import { ok } from "assert";


import currentUser from "./resolvers/queries/currentUser";
import list from "./resolvers/queries/list";
import multiSearch from "./resolvers/queries/multiSearch";
import addTvShowToList from "./resolvers/mutations/addTvShowToList";
import createList from "./resolvers/mutations/createList";
import updateListDetails from "./resolvers/mutations/updateListDetails";
import updatePositions from "./resolvers/mutations/updatePositions";
import updateComment from "./resolvers/mutations/updateComment";
import suggestions from "./resolvers/queries/suggestions";
import addMovieToList from "./resolvers/mutations/addMovieToList";
import updateBookmark from "./resolvers/mutations/updateBookmark";
import episodes from "./resolvers/queries/episodes";
import updateFavouriteStatus from "./resolvers/mutations/updateFavouriteStatus";
import comingSoon from "./resolvers/queries/comingSoon";
import removeEntryFromList from "./resolvers/mutations/removeEntryFromList";
import twitterAuthHandler from "./auth/twitter";
import googleAuthHandler from "./auth/google";
import deleteList from "./resolvers/mutations/deleteList";
import updateWatched from "./resolvers/mutations/updateWatched";
import updateAccount from "./resolvers/mutations/updateAccount";
import deleteAccount from "./resolvers/mutations/deleteAccount";
import listAsComparison from "./resolvers/queries/listAsComparison";
import githubAuthHandler from "./auth/github";


console.log(process.env.NODE_ENV);

require("dotenv").config({ path: `./.env.${process.env.NODE_ENV}` });

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

ok(process.env.MONGODB_URI);
connect(process.env.MONGODB_URI);

const root = {
  suggestions: suggestions, // used by autocompledte
  episodes: episodes,
  addTvShowToList: addTvShowToList,
  multiSearch: multiSearch,
  createList: createList,
  listAsComparison: listAsComparison,
  deleteList: deleteList,
  updateListDetails: updateListDetails,
  updatePositions: updatePositions,
  updateComment: updateComment,
  updateBookmark: updateBookmark,
  comingSoon: comingSoon,
  updateFavouriteStatus: updateFavouriteStatus,
  list: list,
  updateWatched: updateWatched,
  currentUser: currentUser,
  addMovieToList,
  removeEntryFromList: removeEntryFromList,
  updateAccount: updateAccount,
  deleteAccount: deleteAccount,
};

function isUserAuthenticated(req: any, res: any, next: any) {
  //console.log("isUserAuthenticated?", req.body);
  if (req.user) {
    next();
  } else {
    if (
      req.body.operationName === "List" ||
      req.body.operationName === "Episodes" ||
      req.body.operationName === "CurrentUser"
    ) {
      next();
    } else {
      res.status(403).send(`Access denied: ${req.body.operationName}`);
    }
  }
}

type User = {
  _id?: number;
  email?: string;
};

// encode user.id into cookie
passport.serializeUser((user: User, done) => {
  console.log("serializeUser", user);
  done(null, user._id);
});

// decode cookie and persist session
passport.deserializeUser((id, done) => {
  console.log("deserializeUser", id);
  User.findById(id).then((user) => {
    done(null, user);
  });
});

const app = express();
const corsOptions = {
  origin: ["http://localhost:3000", "http://ec2-18-207-247-49.compute-1.amazonaws.com"],
  credentials: true, // !
};
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(express.json());

// preparation for passportjs
ok(process.env.COOKIE_SECRET);
ok(process.env.COOKIE_DURATION_DAYS);
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000 * +process.env.COOKIE_DURATION_DAYS, 
    secret: process.env.COOKIE_SECRET,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/**
 * TWITTER
 */

ok(process.env.TWITTER_KEY);
ok(process.env.TWITTER_SECRET);
ok(process.env.TWITTER_CALLBACK);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_KEY,
      consumerSecret: process.env.TWITTER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK,
      includeEmail: true,
    },
    twitterAuthHandler
  )
);

app.get("/auth/twitter", passport.authenticate("twitter"));
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "/auth/failure",
    failureMessage: true,
  }),
  function (req, res) {
    ok(process.env.SUCCESS_REDIRECT);
    res.status(301).redirect(process.env.SUCCESS_REDIRECT);
  }
);

/**
 * GOOGLE
 */

ok(process.env.GOOGLE_ID);
ok(process.env.GOOGLE_SECRET);
ok(process.env.GOOGLE_CALLBACK);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
    },
    googleAuthHandler
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"],
    prompt: "select_account",
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    failureMessage: true,
  }),
  function (req, res) {
    ok(process.env.SUCCESS_REDIRECT);
    res.status(301).redirect(process.env.SUCCESS_REDIRECT);
  }
);

/**
 * GITHUB
 */

 ok(process.env.GITHUB_ID);
 ok(process.env.GITHUB_SECRET);
 ok(process.env.GITHUB_CALLBACK);
 
 passport.use(
   new GitHubStrategy(
     {
       clientID: process.env.GITHUB_ID,
       clientSecret: process.env.GITHUB_SECRET,
       callbackURL: process.env.GITHUB_CALLBACK,
     },
     githubAuthHandler
   )
 );
 
 app.get(
   "/auth/github",
   passport.authenticate("github", {
     scope: ["user:email"]
   })
 );
 app.get(
   "/auth/github/callback",
   passport.authenticate("github", {
     failureRedirect: "/auth/failure",
     failureMessage: true,
   }),
   function (req, res) {
     ok(process.env.SUCCESS_REDIRECT);
     res.status(301).redirect(process.env.SUCCESS_REDIRECT);
   }
 );

/**
 * LOGOUT
 */

app.get("/auth/logout", function (req, res) {
  console.log("trying to logout");
  req.logout();
  res.status(200).send("success");
});

app.get("/auth/failure", function (req, res) {
  console.log("auth failure");
  res.send("Something went horribly wrong!");
});

app.use(
  "/graphql",
  isUserAuthenticated,
  graphqlHTTP((request: any, response, graphQLParams) => ({
    schema: schema,
    rootValue: root,
    graphiql: true,
    context: {
      user: request.user,
    },
  }))
);

connection.on('error', (error) => {
  console.log('error: failed to connect to database, server not started', error);
  process.exit(1);
});

connection.once('open', async () => {
  app.listen(4000);
  console.log("running");
  console.log(process.env.TWITTER_CALLBACK);
  console.log(process.env.GOOGLE_CALLBACK);
  console.log(process.env.GITHUB_CALLBACK);    
});