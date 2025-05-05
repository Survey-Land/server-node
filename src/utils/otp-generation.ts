
import { randomInt } from "crypto";
import bcrypt from "bcrypt";

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function hashOtp(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export async function compareOtp(plain: string, otpHash: string) {
  return bcrypt.compare(plain, otpHash);
}

export function getExpiry(minutes = 5) {
  return new Date(Date.now() + minutes * 60_000);
}
