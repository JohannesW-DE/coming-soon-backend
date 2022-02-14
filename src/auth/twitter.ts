import { User } from "../schema/User";

export default async function twitterAuthHandler(accessToken: string, refreshToken: string, profile: any, done: any) {
  console.log("got twitter profile", profile);

    // 1. user with twitter id?
  const userWithTwitterId = await User.findOne({twitter_id: profile.id});
  console.log("userWithTwitterId", userWithTwitterId);

  if (userWithTwitterId) {
    done(null, userWithTwitterId);
  } else {
    // 2. user with email?
    const emails = profile.emails.map((e: {value: string}) => e.value);

    const userWithEmail = await User.findOne({'email': { $in: emails }});
    console.log("userWithEmail", userWithEmail)

    if (userWithEmail) { // add twitter id to existing user
      userWithEmail.twitter_id = profile.id;
      if (userWithEmail.username === '') {
        userWithEmail.username = profile.username;
      }
      userWithEmail.save().then((result) => {
        console.log("userWithEmail -> saved", result)
        done(null, userWithEmail);
      });
    } else { // 3. create new user
      const newUser = new User({
        'twitter_id': profile.id,
        'google_id': '',
        'github_id': '',
        'username': profile.username,
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
}