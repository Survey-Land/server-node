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
    if (!user || !user.password)
      throw new CustomError(i18n.__("Incorrect email or password"), 400);
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new CustomError(i18n.__("Incorrect email or password"), 400);
    return user;
  }

  async adminLogin(email: string, password: string, lang: string) {
    i18n.setLocale(lang);
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.password) {
      throw new CustomError(i18n.__("Incorrect email or password"), 400);
    }
    
    if (user.role !== 'admin' && user.role !== 'superAdmin') {
      throw new CustomError(i18n.__("Access denied: Admin permission required"), 403);
    }
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new CustomError(i18n.__("Incorrect email or password"), 400);
    
    return user;
  }

  async createAdmin(data: { email: string; password: string; name: string }, creatorId: string) {
    const creator = await prisma.user.findUnique({ where: { id: creatorId } });
    
    if (!creator || creator.role !== 'superAdmin') {
      throw new CustomError(i18n.__("Only superAdmin can create admins"), 403);
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new CustomError(i18n.__("Email already in use"), 400);
    }
    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: 'admin',
        provider: 'local',
        isEmailVerified: true, // Admin accounts are pre-verified
        userIsActive: true
      }
    });
  }

  async deleteAdmin(adminId: string, requesterId: string) {
    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    
    if (!requester || requester.role !== 'superAdmin') {
      throw new CustomError(i18n.__("Only superAdmin can delete admins"), 403);
    }
    
    const adminToDelete = await prisma.user.findUnique({ where: { id: adminId } });
    
    if (!adminToDelete) {
      throw new CustomError(i18n.__("Admin not found"), 404);
    }
    
    if (adminToDelete.role === 'superAdmin') {
      throw new CustomError(i18n.__("SuperAdmin cannot be deleted"), 403);
    }
    
    return prisma.user.delete({ where: { id: adminId } });
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

    const { user, otpPlain } = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } });
      if (existing?.isEmailVerified)
        throw new Error(i18n.__("Email already in use"));

      const hashedPw = await bcrypt.hash(password, 10);

      const user =
        existing ??
        (await tx.user.create({
          data: {
            email,
            name,
            password: hashedPw,
            provider: "local",
            role: "user",
            isEmailVerified: false,
          },
        }));

      const otpPlain = generateOtp();
      const otpHash = await hashOtp(otpPlain);

      await tx.oTP.upsert({
        where: { email },
        update: { otpHash, expiresAt: getExpiry(5) },
        create: { email, otpHash, expiresAt: getExpiry(5) },
      });

      return { user, otpPlain };
    });

    try {
      await sendOtpEmail(
        email,
        i18n.__("Verify your email"),
        otpPlain,
        "5",
        lang
      );

      return { user, mailSent: true };
    } catch (err) {
      logger.error("OTP email failed", { email, err: (err as Error).message });
      return { user, mailSent: false };
    }
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

    await sendOtpEmail(
      email,
      i18n.__("Verify your email"),
      otpPlain,
      "5",
      lang
    );
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
    if (!user) {
      throw new Error("Invalid userId");
    }
    const hashedPass = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPass,
      },
    });
  }
}
