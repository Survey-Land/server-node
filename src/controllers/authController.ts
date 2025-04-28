import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { generateToken } from "../utils/jwt.util";
import i18n from "../config/i18n";

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

      const refreshToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        message: i18n.__("Logged in successfully"),
        accessToken,
        refreshToken,
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
