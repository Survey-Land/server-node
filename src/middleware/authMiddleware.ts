import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { User } from '@prisma/client';
import dotenv from 'dotenv';
import i18n from '../config/i18n';

dotenv.config(); 

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; email: string; role: string };

      const user: User | null = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ message: i18n.__('User not found') });
      }
    } catch (error) {
      res.status(401).json({ message: i18n.__('Invalid token') });
    }
  } else {
    res.status(401).json({ message: i18n.__('No token provided') });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as User;
  
  if (user && (user.role === 'admin' || user.role === 'superAdmin')) {
    next();
  } else {
    res.status(403).json({ message: i18n.__('Access denied: Admin permission required') });
  }
};

export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as User;
  
  if (user && user.role === 'superAdmin') {
    next();
  } else {
    res.status(403).json({ message: i18n.__('Access denied: SuperAdmin permission required') });
  }
};

