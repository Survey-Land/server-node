"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_github2_1 = require("passport-github2");
const passport_twitter_1 = require("passport-twitter");
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const jwtOpts = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_ACCESS_SECRET || "adsdsdFSDSDAq12312AQW!",
};
passport_1.default.use(new passport_jwt_1.Strategy(jwtOpts, async (jwtPayload, done) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: jwtPayload.id },
        });
        return done(null, user || false);
    }
    catch (error) {
        return done(error, false);
    }
}));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email)
            return done(null, false);
        let user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma_1.default.user.create({
                data: {
                    email,
                    name: profile.displayName,
                    provider: "google",
                    role: client_1.UserRole.USER,
                },
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
}));
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email)
            return done(null, false);
        let user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma_1.default.user.create({
                data: {
                    email,
                    name: profile.displayName || profile.username || "No Name",
                    provider: "github",
                    role: client_1.UserRole.USER,
                },
            });
        }
        return done(null, user);
    }
    catch (error) {
        console.error("GitHub Auth Error:", error);
        return done(error, false);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((obj, done) => {
    done(null, obj);
});
passport_1.default.use(new passport_twitter_1.Strategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL,
    includeEmail: true,
    passReqToCallback: true,
}, async function (req, token, tokenSecret, profile, done) {
    try {
        if (profile._json.suspended) {
            return done(new Error("Twitter account is suspended. Please use another account."), null);
        }
        let user = await prisma_1.default.user.findUnique({
            where: { email: profile.emails?.[0]?.value },
        });
        if (user && user.provider !== "twitter") {
            return done(new Error(`User already registered with ${user.provider} provider`), null);
        }
        if (!user) {
            user = await prisma_1.default.user.create({
                data: {
                    email: profile.emails?.[0]?.value,
                    name: profile.displayName,
                    provider: "twitter",
                    role: client_1.UserRole.USER,
                    isEmailVerified: true,
                    userIsActive: true,
                },
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, null);
    }
}));
exports.default = passport_1.default;
