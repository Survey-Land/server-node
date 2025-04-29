import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import {
  generateRefetchToken,
  generateToken,
  verifyRefreshToken,
} from "../utils/jwt.util";
import i18n from "../config/i18n";
import { JwtPayload } from "../types/global";
export class AuthController {
  private authService = new AuthService();

  private setLocale(req: Request) {
    const lang = req.headers["accept-language"] || "ar";
    i18n.setLocale(lang as string);
    return lang;
  }

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = this.setLocale(req);
      const users = await this.authService.findAll(req.query, lang);
      res.json(users);
    } catch (e) {
      next(e);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = this.setLocale(req);
      const { email, password, name } = req.body;

      const user = await this.authService.register(
        { email, password, name },
        lang
      );
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        message: i18n.__("User registered successfully"),
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

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = this.setLocale(req);
      const { email, password } = req.body;

      const user = await this.authService.login(email, password, lang);

      const accessToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefetchToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const expiry = new Date();

      expiry.setDate(expiry.getDate() + 7);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/api/auth/refresh",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
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

  profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.setLocale(req);
      const { id } = req.user as { id: string };
      const profile = await this.authService.getProfile(id);
      res.json(profile);
    } catch (e) {
      next(e);
    }
  };

  logout = (req: Request, res: Response): void => {
    this.setLocale(req);

    res.json({ message: i18n.__("Logged out successfully") });
  };
}
