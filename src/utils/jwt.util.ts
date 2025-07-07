// utils/jwt.ts
import jwt from "jsonwebtoken";

export const signAccess = (payload: object) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, { expiresIn: "2d" });

export const signRefresh = (payload: object) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });

export const verifyRefresh = (token: string) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
