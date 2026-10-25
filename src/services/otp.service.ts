import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { AppError, badRequest } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { sendOtp as deliverOtp } from "@/lib/otp-delivery";
import type { OtpType } from "@/lib/validation/auth";

const OTP_EXPIRATION_MS = 10 * 60 * 1000;
const RESET_EXPIRATION_MS = 15 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
const SEND_COOLDOWN_MS = 60 * 1000;
const SEND_HOURLY_LIMIT = 5;

const GENERIC_SEND_MESSAGE = "إذا كان الحساب مسجلاً، فقد تم إرسال رمز التحقق";

const normalize = (identifier: string) => identifier.trim().toLowerCase();
// Identifiers are namespaced per purpose so one flow can never touch another's tokens.
const otpKey = (type: OtpType, id: string) => `otp:${type}:${id}`;
const resetKey = (id: string) => `reset:${id}`;

function digest(namespace: string, id: string, secret: string) {
  const pepper = process.env.OTP_PEPPER ?? "";
  return createHash("sha256").update(`${pepper}|${namespace}|${id}|${secret}`).digest("hex");
}

function safeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export interface SendOtpResult {
  success: boolean;
  expiresAt: Date;
  message: string;
  devCode?: string;
}

export class OtpService {
  /**
   * Generate, store (hashed) and deliver a 6-digit OTP.
   * For PASSWORD_RESET the response is identical whether or not the account exists.
   */
  static async sendOtp(identifier: string, type: OtpType = "PASSWORD_RESET"): Promise<SendOtpResult> {
    const id = normalize(identifier);

    // Applied before any DB lookup so it cannot reveal account existence.
    rateLimit(`otp-cooldown:${type}:${id}`, 1, SEND_COOLDOWN_MS);
    rateLimit(`otp-hourly:${type}:${id}`, SEND_HOURLY_LIMIT, 60 * 60 * 1000);

    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MS);
    const base = { success: true, expiresAt, message: GENERIC_SEND_MESSAGE };

    if (type === "PASSWORD_RESET") {
      const user = await prisma.user.findFirst({
        where: { OR: [{ email: id }, { phone: id }] },
        select: { id: true },
      });
      if (!user) return base;
    }

    const code = randomInt(100000, 1000000).toString();
    const namespace = otpKey(type, id);

    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { identifier: namespace } }),
      prisma.verificationToken.create({
        data: {
          identifier: namespace,
          token: digest("otp", namespace, code),
          expires: expiresAt,
        },
      }),
    ]);

    try {
      await deliverOtp(id, code, type);
    } catch (err) {
      await prisma.verificationToken.deleteMany({ where: { identifier: namespace } });
      throw err;
    }

    const echo = process.env.OTP_DEV_ECHO === "true" || process.env.NODE_ENV !== "production";
    return { ...base, ...(echo ? { devCode: code } : {}) };
  }

  /**
   * Verify a code. PASSWORD_RESET additionally returns a single-use resetToken.
   */
  static async verifyOtp(identifier: string, token: string, type: OtpType = "PASSWORD_RESET") {
    const id = normalize(identifier);
    const namespace = otpKey(type, id);
    const invalid = () => badRequest("رمز التحقق غير صحيح أو منتهي الصلاحية");

    const record = await prisma.verificationToken.findFirst({ where: { identifier: namespace } });
    if (!record) throw invalid();

    if (new Date() > record.expires) {
      await prisma.verificationToken.deleteMany({ where: { identifier: namespace } });
      throw invalid();
    }

    // Count the attempt before comparing so parallel guesses are still limited.
    const updated = await prisma.verificationToken.update({
      where: { token: record.token },
      data: { attempts: { increment: 1 } },
    }).catch(() => null);
    if (!updated) throw invalid();

    if (updated.attempts > MAX_VERIFY_ATTEMPTS) {
      await prisma.verificationToken.deleteMany({ where: { identifier: namespace } });
      throw invalid();
    }

    const supplied = digest("otp", namespace, token.trim());
    if (!safeEqualHex(supplied, record.token)) {
      if (updated.attempts >= MAX_VERIFY_ATTEMPTS) {
        await prisma.verificationToken.deleteMany({ where: { identifier: namespace } });
      }
      throw invalid();
    }

    // Single use: only the request that deletes the row succeeds.
    const claimed = await prisma.verificationToken.deleteMany({ where: { token: record.token } });
    if (claimed.count === 0) throw invalid();

    if (type !== "PASSWORD_RESET") return { verified: true };

    const resetToken = randomBytes(32).toString("base64url");
    const rKey = resetKey(id);
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { identifier: rKey } }),
      prisma.verificationToken.create({
        data: {
          identifier: rKey,
          token: digest("reset", rKey, resetToken),
          expires: new Date(Date.now() + RESET_EXPIRATION_MS),
        },
      }),
    ]);

    return { verified: true, resetToken };
  }

  /**
   * Reset password with a verified single-use reset token. Revokes all sessions.
   * `newPassword` must already satisfy passwordSchema (validated in the route).
   */
  static async resetPassword(identifier: string, resetToken: string, newPassword: string) {
    const id = normalize(identifier);
    const rKey = resetKey(id);
    const invalid = () =>
      badRequest("جلسة إعادة التعيين منتهية الصلاحية أو غير صالحة. يرجى البدء من جديد");

    const hashedToken = digest("reset", rKey, resetToken);
    const record = await prisma.verificationToken.findUnique({ where: { token: hashedToken } });
    if (!record || record.identifier !== rKey) throw invalid();
    if (new Date() > record.expires) {
      await prisma.verificationToken.deleteMany({ where: { identifier: rKey } });
      throw invalid();
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: id }, { phone: id }] },
      select: { id: true },
    });
    if (!user) throw invalid();

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
      // Claim the token first so concurrent requests can't reuse it.
      const claimed = await tx.verificationToken.deleteMany({ where: { token: hashedToken } });
      if (claimed.count === 0) throw new AppError(400, "جلسة إعادة التعيين غير صالحة");
      await tx.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
      await tx.session.deleteMany({ where: { userId: user.id } });
      await tx.verificationToken.deleteMany({ where: { identifier: rKey } });
    });

    return {
      success: true,
      message: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة",
    };
  }
}
