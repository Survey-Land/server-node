// src/utils/response.ts
import { Request } from "express";
import i18n from "../config/i18n";


export function setLocale(req: Request): string {
  const lang = (req.headers["accept-language"] as string) || "ar";
  i18n.setLocale(lang);
  return lang;
}


export function sendResponse<T>(
  success: boolean,
  message: string,
  data: T | null = null
) {
  return { success, message, data };
}
