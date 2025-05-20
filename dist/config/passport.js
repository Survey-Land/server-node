"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_github2_1 = require("passport-github2");
const prisma_1 = __importDefault(require("../lib/prisma"));
const jwtOpts = {
  jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "adsdsdFSDSDAq12312AQW!",
};
passport_1.default.use(
  new passport_jwt_1.Strategy(jwtOpts, async (jwtPayload, done) => {
    try {
      const user = await prisma_1.default.user.findUnique({
        where: { id: jwtPayload.id },
      });
      return done(null, user || false);
    } catch (error) {
      return done(error, false);
    }
  })
);
passport_1.default.use(
  new passport_google_oauth20_1.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false);
        let user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma_1.default.user.create({
            data: {
              email,
              name: profile.displayName,
              provider: "google",
              // role: "user",
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
passport_1.default.use(
  new passport_github2_1.Strategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false);
        let user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma_1.default.user.create({
            data: {
              email,
              name: profile.displayName || profile.username || "No Name",
              provider: "github",
              // role: "user",
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
exports.default = passport_1.default;
