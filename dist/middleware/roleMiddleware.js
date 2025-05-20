"use strict";
// import { Request, Response, NextFunction } from "express";
// import i18n from "../config/i18n";
// import { User, UserRole} from "@prisma/client";
// export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   if (!req.user) {
//     res.status(401).json({ message: i18n.__("Unauthorized: No user found") });
//     return;
//   }
//   const user = req.user as User;
//   if (!user.isAdmin) {
//     res.status(403).json({ message: i18n.__("Forbidden: Admin access required") });
//     return;
//   }
//   next();
// };
// export const isEditor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   if (!req.user) {
//     res.status(401).json({ message: i18n.__("Unauthorized: No user found") });
//     return;
//   }
//   const user = req.user as User;
//   if (user.role !== UserRole.EDITOR && !user.isAdmin) {
//     res.status(403).json({ message: i18n.__("Forbidden: Editor access required") });
//     return;
//   }
//   next();
// }; 
