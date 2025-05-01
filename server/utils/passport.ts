import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model';

// Configure Passport to use Google Strategy
// Log OAuth configuration parameters to help with debugging
console.log('Google OAuth Configuration:');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our database
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Extract profile information from Google
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
          const profileImage = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
          const firstName = profile.name?.givenName || '';
          const lastName = profile.name?.familyName || '';
          
          // Check if a user with this email exists but without googleId
          const existingEmailUser = await User.findOne({ email });
          
          if (existingEmailUser) {
            // Link the Google account to the existing account
            existingEmailUser.googleId = profile.id;
            existingEmailUser.authProvider = 'google';
            existingEmailUser.isVerified = true;
            await existingEmailUser.save();
            return done(null, existingEmailUser);
          }

          // Create a new user
          user = await User.create({
            googleId: profile.id,
            email,
            fullname: `${firstName} ${lastName}`.trim(),
            profilePicture: profileImage,
            isVerified: true, // Auto-verify Google users
            authProvider: 'google',
            contact: 0, // Set a default value (should be updated by user later)
          });
        }

        // Update last login time
        user.lastLogin = new Date();
        await user.save();
        
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
