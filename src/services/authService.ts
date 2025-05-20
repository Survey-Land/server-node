// src/services/authService.ts
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { CustomError } from "../utils/custom-error";
import { handlePrismaError } from "../utils/prisma-error";
import { processFilters, parseInclude } from "../utils/query-parser";
import i18n from "../config/i18n";
import {
  generateOtp,
  hashOtp,
  getExpiry,
  compareOtp,
} from "../utils/otp-generation";
import { sendOtpEmail } from "../lib/emailService";
import logger from "../lib/logger";
import { th } from "@faker-js/faker/.";

export class AuthService {
  async findAll(query: any, lang: string) {
    i18n.setLocale(lang);
    try {
      let { page, pageSize, include, orderBy, ...filters } = query;
      if (include) include = parseInclude(include);
      if (orderBy) orderBy = parseInclude(orderBy);
      filters = processFilters(filters);
      const options: any = { where: filters, include, orderBy };
      if (page && pageSize) {
        const skip = (+page - 1) * +pageSize;
        const take = +pageSize;
        const [data, total] = await Promise.all([
          prisma.user.findMany({ ...options, skip, take }),
          prisma.user.count({ where: filters }),
        ]);
        return { data, total, page: +page, pageSize: +pageSize };
      }
      return prisma.user.findMany(options);
    } catch (e) {
      handlePrismaError(e, i18n.__("User"));
    }
  }

  async login(email: string, password: string, lang: string) {
    i18n.setLocale(lang);

    const user = await prisma.user.findUnique({ where: { email } });

 
    if (!user || !user.password) {
      throw new CustomError(i18n.__("Incorrect email or password"), 400);
    }

    const now = new Date();

   
    if (user.lockUntil && user.lockUntil > now) {
      throw new CustomError(i18n.__("Account temporarily locked. Try again later."), 423);
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      const failedAttempts: number = user.failedLoginAttempts += 1;

      let lockUntil: Date | null = null;

      await prisma.user.update({
        where: { email },
        data: {
          failedLoginAttempts: failedAttempts,
        },
      });

      if (failedAttempts === 3) {
       
        lockUntil = new Date(Date.now() + 30 * 1000);

        throw new CustomError(i18n.__("Account temporarily locked. Try again in 30 seconds."), 423);
      } else if (failedAttempts > 3) {
    
        lockUntil = new Date(Date.now() + 15 * 60 * 1000);

        
        await sendOtpEmail(
          email,
          i18n.__("OTP resent to your email"),
          generateOtp(),
          i18n.__("valid for %s minutes", ("5"))
        );

        throw new CustomError(i18n.__("Account temporarily locked. Check your email for OTP."), 423);
      }

      await prisma.user.update({
        where: { email },
        data: {
          failedLoginAttempts: failedAttempts,
          lockUntil,
        },
      });

      throw new CustomError(i18n.__("Incorrect email or password"), 400);
    }

    // Reset failed attempts and lock
    await prisma.user.update({
      where: { email },
      data: {
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    });

    // Generate and send OTP after successful login
    const otpPlain = generateOtp();
    const otpHash = await hashOtp(otpPlain);
    
    await prisma.oTP.upsert({
      where: { email },
      update: { otpHash, expiresAt: getExpiry(5) },
      create: { email, otpHash, expiresAt: getExpiry(5) },
    });

    try {
      await sendOtpEmail(
        email,
        i18n.__("Login Verification OTP"),
        otpPlain,
        i18n.__("valid for %s minutes", "5")
      );
      return { user, mailSent: true };
    } catch (err) {
      logger.error("OTP email failed", { email, err: (err as Error).message });
      return { user, mailSent: false };
    }
  }

  async registerInit(
    {
      email,
      password,
      name,
    }: { email: string; password: string; name: string },
    lang: string
  ) {
    i18n.setLocale(lang);
    const hashedPw = await bcrypt.hash(password, 10);
    const otpPlain = generateOtp();
    const otpHash = await hashOtp(otpPlain);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.isEmailVerified)
      throw new Error(i18n.__("Email already in use"));
    const user =
      existing ??
      (await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPw,
          provider: "local",
          role: "USER",
          isEmailVerified: false,
        },
      }));
    await prisma.oTP.upsert({
      where: { email },
      update: { otpHash, expiresAt: getExpiry(5) },
      create: { email, otpHash, expiresAt: getExpiry(5) },
    });
    try {
      await sendOtpEmail(
        email,
        i18n.__("Verify your email"),
        otpPlain,
        i18n.__("valid for %s minutes", "5")
      );
      return { user, mailSent: true };
    } catch (err) {
      logger.error("OTP email failed", { email, err: (err as Error).message });
      return { user, mailSent: false };
    }
  }

  async createAdminUser(
    {
      email,
      password,
      name,
    }: { email: string; password: string; name: string },
    lang: string
  ) {
    i18n.setLocale(lang);
    const hashedPw = await bcrypt.hash(password, 10);
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { isAdmin: true }
    });
    
    if (existingAdmin) {
      throw new Error(i18n.__("Admin user already exists"));
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPw,
        provider: "local",
        role: "ADMIN",
        isAdmin: true,
        isEmailVerified: true,
      },
    });

    return user;
  }

  async deleteUser(id: string, lang: string) {
    i18n.setLocale(lang);
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new CustomError(i18n.__("User not found"), 404);
    }

    if (user.isAdmin) {
      throw new CustomError(i18n.__("Cannot delete admin user"), 403);
    }

    await prisma.user.delete({ where: { id } });
    return { message: i18n.__("User deleted successfully") };
  }

  async updateUserRole(id: string, role: string, lang: string) {
    i18n.setLocale(lang);
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new CustomError(i18n.__("User not found"), 404);
    }

    if (user.isAdmin) {
      throw new CustomError(i18n.__("Cannot modify admin user role"), 403);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role as any },
    });

    return updatedUser;
  }

  async verifyOtp(
    { email, otp }: { email: string; otp: string },
    lang: string
  ) {
    i18n.setLocale(lang);
    return prisma.$transaction(async (tx) => {
      const otpRecord = await tx.oTP.findFirst({ where: { email } });
      if (!otpRecord)
        throw new Error(i18n.__("No OTP found, please request one"));
      if (otpRecord.expiresAt < new Date())
        throw new Error(i18n.__("OTP expired, request a new one"));
      const match = await compareOtp(otp, otpRecord.otpHash);
      if (!match) throw new Error(i18n.__("Invalid OTP"));
      const user = await tx.user.update({
        where: { email },
        data: { isEmailVerified: true },
      });
      await tx.oTP.delete({ where: { id: otpRecord.id } });
      return user;
    });
  }

  async resendOtp(email: string, lang: string) {
    i18n.setLocale(lang);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isEmailVerified)
      throw new Error(i18n.__("Invalid request"));
    const otpPlain = generateOtp();
    const otpHash = await hashOtp(otpPlain);
    await prisma.oTP.upsert({
      where: { email },
      update: { otpHash, expiresAt: getExpiry(5) },
      create: { email, otpHash, expiresAt: getExpiry(5) },
    });
    try {
      await sendOtpEmail(
        email,
        i18n.__("Verify your email"),
        otpPlain,
        i18n.__("valid for %s minutes", "5")
      );
      return { mailSent: true };
    } catch (err) {
      logger.error("OTP email failed", { email, err: (err as Error).message });
      return { mailSent: false };
    }
  }

  async getProfile(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        provider: true,
      },
    });
    if (!user) throw new CustomError(i18n.__("User not found"), 404);
    return user;
  }

  async resetPassword(id: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("Invalid userId");
    const hashedPass = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPass },
    });
  }
}
