import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "@prisma/client";
import prisma from "../lib/prisma";

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || "adsdsdFSDSDAq12312AQW!",
};

passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { id: jwtPayload.id } });
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            done(error, false);
        }
    })
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            // passReqToCallback: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log(profile)
            try {
                const existingUser: User | null = await prisma.user.findUnique({
                    where: { email: profile.emails?.[0]?.value },
                });

                if (existingUser) {
                    return done(null, existingUser);
                }

                const user = await prisma.user.create({
                    data: {
                        email: profile.emails?.[0]?.value as string,
                        name: profile.displayName,
                        provider: profile.provider,
                        role: "user",
                    },
                });

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

export default passport;
