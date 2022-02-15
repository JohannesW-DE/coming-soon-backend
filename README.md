# coming-soon-backend

.env.development or .env.production respectively

```
MONGODB_URI=[mongodb uri]

COOKIE_SECRET=[random string for encryption of session cookie ]
COOKIE_DURATION_DAYS=[max age in days of session cookie]

TMDB_TOKEN=[TMDB API v3 key]

TWITTER_KEY=[Twitter OAuth Key]
TWITTER_SECRET=[Twitter OAuth Secret]
TWITTER_CALLBACK=[{Backend host}/auth/twitter/callback]

GOOGLE_ID=[Twitter OAuth ID]
GOOGLE_SECRET=[Google OAuth Secret]
GOOGLE_CALLBACK=[{Backend host}/auth/google/callback]

GITHUB_ID=[Github OAuth ID]
GITHUB_SECRET=[Github OAuth Secret]
GITHUB_CALLBACK=[{Backend host}/auth/github/callback]

SUCCESS_REDIRECT=[{Frontend host}/coming-soon]
```
