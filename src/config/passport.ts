import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import prisma from "../lib/prisma";

const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || "adsdsdFSDSDAq12312AQW!",
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
                               role: "USER",
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
                            role: "USER",
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

export default passport;