import { User } from "../schema/User";

export default async function googleAuthHandler(accessToken: string, refreshToken: string, profile: any, done: any) {
  console.log("got gooogle profile", profile);

  // 1. user with google id?
  const userWithGoogleId = await User.findOne({google_id: profile.id});
  console.log("userWithGoogleId", userWithGoogleId);

  if (userWithGoogleId) {
    done(null, userWithGoogleId);
  } else {
    // 2. user with email?
    const emails = profile.emails.map((e: {value: string}) => e.value);

    const userWithEmail = await User.findOne({'email': { $in: emails }});
    console.log("userWithEmail", userWithEmail)
  
    if (userWithEmail) { // add google id to existing user
      userWithEmail.google_id = profile.id;
      if (userWithEmail.username === '' && profile.displayName) {
        userWithEmail.username = profile.displayName;
      }
      userWithEmail.save().then((result) => {
        console.log("userWithEmail -> saved", result)
        done(null, userWithEmail);
      });
    } else { // 3. create new user
      const newUser = new User({
        'twitter_id': '',
        'google_id': profile.id,
        'github_id': '',
        'username': profile.displayName ? profile.displayName : '',
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