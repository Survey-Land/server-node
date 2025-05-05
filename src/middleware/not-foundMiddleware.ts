import { Request, Response, NextFunction, RequestHandler } from "express";
import createError from 'http-errors';

export const notFoundHandler: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.path === "/" || req.originalUrl === "/") {
    res.status(200).json({
      status: 200,
      message: "Backend Server is Running 🚀",
    });
    return;                   
  }

  next(createError(404, "الصفحة غير موجودة"));
};


