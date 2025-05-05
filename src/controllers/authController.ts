import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { generateToken, verifyRefreshToken } from "../utils/jwt.util";
import i18n from "../config/i18n";
import passport from "passport";
import { JwtPayload } from "../types/global";
import { setLocale, sendResponse } from "../utils/response";

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

registerInit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lang = setLocale(req);
    const { email, password, name } = req.body;

    const { user, mailSent } = await this.authService.registerInit(
      { email, password, name },
      lang
    );

    res.status(202).json(
      sendResponse(
        true,
        mailSent
          ? i18n.__("OTP sent to your email")
          : i18n.__("OTP created but email failed; please use /otp/resend"),
        null
      )
    );
  } catch (err) {
    next(err);
  }
};


  registerVerify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = setLocale(req);
      const { email, otp } = req.body;

      const user = await this.authService.verifyOtp({ email, otp }, lang);
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json(
        sendResponse(true, i18n.__("Registration complete"), {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        })
      );
    } catch (err) {
      next(err);
    }
  };
  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = setLocale(req);
      const { email } = req.body;

      await this.authService.resendOtp(email, lang);

      res.json(sendResponse(true, i18n.__("OTP resent to your email"), null));
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = setLocale(req);
      const { email, password } = req.body;
      const user = await this.authService.login(email, password, lang);
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      res.json({
        message: i18n.__("Logged in successfully"),
        token,
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

  logout = (_req: Request, res: Response) => {
    setLocale(_req);
    res.json({ message: i18n.__("Logged out successfully") });
  };

  googleLogin = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );
  };

  googleCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { session: false }, (err, user) => {
      if (err || !user)
        return res
          .status(400)
          .json({ message: i18n.__("Authentication failed") });
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      res.json({
        message: i18n.__("Logged in successfully with Google"),
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    })(req, res, next);
  };

  githubLogin(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
  }
  githubCallback = (req: Request, res: Response, next: Function) => {
    passport.authenticate(
      "github",
      { session: false },
      (err: any, user: any, _info: any) => {
        if (err || !user) {
          return res
            .status(400)
            .json({ message: i18n.__("Authentication failed") });
        }

        const token = generateToken({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        res.json({
          message: i18n.__("Logged in successfully with GitHub"),
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      }
    )(req, res, next);
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new Error("Refresh token is missing.");
      }

      const user = verifyRefreshToken(refreshToken) as JwtPayload;

      if (!user) {
        throw new Error("Invalid refresh token payload.");
      }

      const accessToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        message: "Access token refreshed successfully.",
        accessToken,
      });
    } catch (e) {
      next(e);
    }
  };
}
