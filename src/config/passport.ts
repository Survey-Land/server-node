import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as TwitterStrategy } from "passport-twitter";
import prisma from "../lib/prisma";

const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_ACCESS_SECRET || "adsdsdFSDSDAq12312AQW!",
};

passport.use(
    new JwtStrategy(jwtOpts, async (jwtPayload, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: jwtPayload.id },
            });
            return done(null, user || false);
        } catch (error) {
            return done(error, false);
        }
    })
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) return done(null, false);
                let user = await prisma.user.findUnique({ where: { email } });
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: profile.displayName,
                            provider: "google",
                            role: "user",
                        },
                    });
                }
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            callbackURL: process.env.GITHUB_CALLBACK_URL as string,
        },
        async (
            _accessToken: string,
            _refreshToken: string,
            profile: any,
            done: Function
        ) => {
            try {
                const email = profile.emails?.[0]?.value;

                if (!email) return done(null, false);

                let user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name:
                                profile.displayName ||
                                profile.username ||
                                "No Name",
                            provider: "github",
                            role: "user",
                        },
                    });
                }

                return done(null, user);
            } catch (error) {
                console.error("GitHub Auth Error:", error);
                return done(error, false);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user);
});

passport.deserializeUser((obj: any, done) => {
    done(null, obj);
});

passport.use(
    new TwitterStrategy(
        {
            consumerKey: process.env.TWITTER_CONSUMER_KEY!,
            consumerSecret: process.env.TWITTER_CONSUMER_SECRET!,
            callbackURL: process.env.TWITTER_CALLBACK_URL!,
            includeEmail: true,
            passReqToCallback: true,
        },
        async function (req, token, tokenSecret, profile, done) {
            try {
                // Check if the profile not suspended
                if (profile._json.suspended) {
                    return done(
                        new Error(
                            "Twitter account is suspended. Please use another account."
                        ),
                        null
                    );
                }

                // Check if the user already exists in the database
                let user = await prisma.user.findUnique({
                    where: { email: profile.emails?.[0]?.value },
                });

                // If the user exists, update their information
                if (user && user.provider !== "twitter") {
                    return done(
                        new Error(
                            `User already registered with ${user.provider} provider`
                        ),
                        null
                    );
                }

                if (!user) {
                    // If the user doesn't exist, create a new user
                    user = await prisma.user.create({
                        data: {
                            email: profile.emails?.[0]?.value as string,
                            name: profile.displayName,
                            provider: "twitter",
                            role: "user",
                            isEmailVerified: true,
                            userIsActive: true,
                        },
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);
export default passport;
