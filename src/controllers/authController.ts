
// controllers/authController.ts
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import i18n from "../config/i18n";
import { AuthService } from "../services/authService";
import { JwtPayload } from "../types/global";
import { signAccess, signRefresh, verifyRefresh } from "../utils/jwt.util";
import { sendResponse, setLocale } from "../utils/response";
import { User } from "@prisma/client";


const cookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  private authService = new AuthService();

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = setLocale(req);
      const users = await this.authService.findAll(req.query, lang);
      res.json(users);
    } catch (e) {
      next(e);
    }
  };

  registerInit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = setLocale(req);
      const { email, password, name } = req.body;

      const { mailSent } = await this.authService.registerInit(
        { email, password, name },
        lang
      );

      res
        .status(202)
        .json(
          sendResponse(
            true,
            mailSent
              ? i18n.__("OTP sent to your email")
              : i18n.__("OTP created but email failed; please use /otp/resend")
          )
        );
    } catch (e) {
      next(e);
    }
  };

  registerVerify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = setLocale(req);
      const { email, otp } = req.body;

      const user = await this.authService.verifyOtp({ email, otp }, lang);

      const accessToken = signAccess({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      const refreshToken = signRefresh({ id: user.id });

      res
        .cookie("refreshToken", refreshToken, cookieOptions)
        .status(201)
        .json(
          sendResponse(true, i18n.__("Registration complete"), {
            accessToken,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          })
        );
    } catch (e) {
      next(e);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = setLocale(req);
      const { email } = req.body;

      await this.authService.resendOtp(email, lang);

      res.json(sendResponse(true, i18n.__("OTP resent to your email"), null));
    } catch (e) {
      next(e);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = setLocale(req);
      const { email, password } = req.body;

      const user = await this.authService.login(email, password, lang);

      const accessToken = signAccess({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      const refreshToken = signRefresh({ id: user.id });

      res.cookie("refreshToken", refreshToken, cookieOptions).json({
        message: i18n.__("Logged in successfully"),
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (e) {
      next(e);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) throw new Error("No refresh token");

      const payload = verifyRefresh(refreshToken) as JwtPayload;

      const accessToken = signAccess({
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });

      res.json({ success: true, accessToken });
    } catch (e) {
      next(e);
    }
  };

  logout = (_req: Request, res: Response) => {
    setLocale(_req);
    res.clearCookie("refreshToken", cookieOptions).json({
      message: i18n.__("Logged out successfully"),
    });
  };

  profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      setLocale(req);
      const { id } = req.user as { id: string };
      const profile = await this.authService.getProfile(id);
      res.json(profile);
    } catch (e) {
      next(e);
    }
  };

  googleLogin = (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );

  googleCallback = (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate("google", { session: false }, (err, user) => {
      if (err || !user)
        return res
          .status(400)
          .json({ message: i18n.__("Authentication failed") });

      const accessToken = signAccess({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      const refreshToken = signRefresh({ id: user.id });

      res.cookie("refreshToken", refreshToken, cookieOptions).json({
        message: i18n.__("Logged in successfully with Google"),
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    })(req, res, next);

  githubLogin = (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate("github", { scope: ["user:email"] })(req, res, next);

  githubCallback = (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate(
      "github",
      { session: false },
      (err: any, user: any) => {
        if (err || !user)
          return res
            .status(400)
            .json({ message: i18n.__("Authentication failed") });

        const accessToken = signAccess({
          id: user.id,
          email: user.email,
          role: user.role,
        });
        const refreshToken = signRefresh({ id: user.id });

        res.cookie("refreshToken", refreshToken, cookieOptions).json({
          message: i18n.__("Logged in successfully with GitHub"),
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      }
    )(req, res, next);

  twitterLogin = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("twitter", { session: true })(req, res, next);
  };

  twitterCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "twitter",
      { session: true },
      async (err: any, user: any) => {
        if (err || !user) {
          const errorDetails =
            err instanceof Error ? { message: err.message } : err;

          return res.status(500).json({
            message: i18n.__("Authentication failed"),
            error: errorDetails,
          });
        }

        const accessToken = signAccess({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        const refreshToken = signRefresh({ id: user.id });

        res.cookie("refreshToken", refreshToken, cookieOptions);

        res.json({
          message: i18n.__("Logged in successfully with Twitter"),
          accessToken,
          user,
        });
      }
    )(req, res, next);
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      setLocale(req);
      const user = req.user as User;
      const { newPassword } = req.body;

      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      if (!newPassword) {
        res.status(400).json({
          message: i18n.__("Password is required"),
        });
        return;
      }

      await this.authService.resetPassword(user.id, newPassword);
      res.json({ message: i18n.__("Password reset successfully") });
    } catch (e) {
      next(e);
    }
  };
   

    deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const lang = setLocale(req);
            const { id } = req.params;
            const result = await this.authService.deleteUser(id, lang);
            res.json(result);
        } catch (e) {
            next(e);
        }
    };

    updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const lang = setLocale(req);
            const { id } = req.params;
            const { role } = req.body;
            const user = await this.authService.updateUserRole(id, role, lang);
            res.json({
                message: i18n.__("User role updated successfully"),
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        } catch (e) {
            next(e);
        }
    };
}
