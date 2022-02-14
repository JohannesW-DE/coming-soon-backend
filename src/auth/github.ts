import { User } from "../schema/User";

export default async function githubAuthHandler(accessToken: string, refreshToken: string, profile: any, done: any) {
  console.log("got github profile", profile);

  // 1. user with github id?
  const userWithGithubId = await User.findOne({github_id: profile.id});
  console.log("userWithGithubId", userWithGithubId);

  if (userWithGithubId) {
    done(null, userWithGithubId);
  } else {
    const newUser = new User({
      'twitter_id': '',
      'google_id': '',
      'github_id': profile.id,
      'username': profile.displayName ? profile.displayName : profile.username,
      'bookmarks': [],
      'watched': [],
      'settings': [
        {
          'key': 'countries',
          'values:': ['US'],
        }
      ]
    });
    const savedUser = await newUser.save();
    console.log("new user", savedUser)
    done(null, savedUser);
  }
}