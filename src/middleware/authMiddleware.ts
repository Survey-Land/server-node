import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { User } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config(); 

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string; email: string; role: string };

      const user: User | null = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ message: 'غير مصرح: المستخدم غير موجود' });
      }
    } catch (error) {
      res.status(401).json({ message: 'غير مصرح: رمز دخول غير صالح' });
    }
  } else {
    res.status(401).json({ message: 'غير مصرح: لم يتم تقديم رمز دخول' });
  }
};
