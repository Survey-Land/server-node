// src/utils/jwt.util.ts
import jwt from "jsonwebtoken";

export function generateToken(payload: object): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15M" });
}

export function generateRefetchToken(payload: object): string {
  if (!process.env.REFRESH_TOKEN) {
    throw new Error("REFRESH_TOKEN is not defined in environment variables");
  }

  return jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: "30d" });
}

export function verifyRefreshToken(refreshToken: string) {
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN as string);
  return decoded;
}
