import { Request } from "express";
import i18n from "../config/i18n";
export default abstract class Controller {
  protected setLocale(req: Request) {
    const lang = req.headers["accept-language"] || "ar";
    i18n.setLocale(lang);
    return lang;
  }

  protected sendResponse(success: boolean, message: string, data: any) {
    return {
      success,
      message,
      data,
    };
  }
}
