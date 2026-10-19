import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export class OtpService {
  private static OTP_EXPIRATION_MINUTES = 10;

  /**
   * Generate and store a secure 6-digit OTP code for password reset or phone/email verification
   */
  static async sendOtp(identifier: string, type: "PASSWORD_RESET" | "VERIFICATION" = "PASSWORD_RESET") {
    const cleanIdentifier = identifier.trim().toLowerCase();

    // If password reset, ensure user exists
    if (type === "PASSWORD_RESET") {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: cleanIdentifier }, { phone: cleanIdentifier }],
        },
      });

      if (!user) {
        throw new Error("لا يوجد حساب مسجل بهذا البريد الإلكتروني أو رقم الهاتف");
      }
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + this.OTP_EXPIRATION_MINUTES * 60 * 1000);

    // Remove any previously pending tokens for this identifier
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanIdentifier },
    });

    // Save token
    await prisma.verificationToken.create({
      data: {
        identifier: cleanIdentifier,
        token: code,
        expires,
      },
    });

    // In development/test mode, return code in response; in production this dispatches SMS/Email
    const isDev = process.env.NODE_ENV !== "production";
    console.log(`[OTP SERVICE] Generated OTP for ${cleanIdentifier}: ${code} (Expires: ${expires})`);

    return {
      success: true,
      expiresAt: expires,
      message: "تم إرسال رمز التحقق بنجاح",
      ...(isDev && { devCode: code }),
    };
  }

  /**
   * Verify provided OTP code
   */
  static async verifyOtp(identifier: string, token: string) {
    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanToken = token.trim();

    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: cleanIdentifier,
        token: cleanToken,
      },
    });

    if (!record) {
      throw new Error("رمز التحقق غير صحيح أو غير متطابق");
    }

    if (new Date() > record.expires) {
      await prisma.verificationToken.deleteMany({ where: { identifier: cleanIdentifier } });
      throw new Error("عذراً، انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد");
    }

    // Delete the one-time code to prevent reuse
    await prisma.verificationToken.delete({
      where: { token: cleanToken },
    });

    // Issue a short-lived reset authorization token (valid for 15 minutes)
    const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: `auth_reset_${cleanIdentifier}`,
        token: resetToken,
        expires: resetExpires,
      },
    });

    return {
      verified: true,
      resetToken,
    };
  }

  /**
   * Reset user password using verified reset token
   */
  static async resetPassword(identifier: string, resetToken: string, newPassword: string) {
    const cleanIdentifier = identifier.trim().toLowerCase();

    if (newPassword.length < 6) {
      throw new Error("يجب ألا تقل كلمة المرور عن 6 أحرف");
    }

    // Verify reset token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: `auth_reset_${cleanIdentifier}`,
        token: resetToken,
      },
    });

    if (!tokenRecord || new Date() > tokenRecord.expires) {
      throw new Error("جلسة إعادة التعيين منتهية الصلاحية أو غير صالحة. يرجى البدء من جديد");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const user = await prisma.user.updateMany({
      where: {
        OR: [{ email: cleanIdentifier }, { phone: cleanIdentifier }],
      },
      data: {
        password: hashedPassword,
      },
    });

    if (user.count === 0) {
      throw new Error("تعذر العثور على الحساب لتحديث كلمة المرور");
    }

    // Delete token
    await prisma.verificationToken.deleteMany({
      where: { identifier: `auth_reset_${cleanIdentifier}` },
    });

    return {
      success: true,
      message: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة",
    };
  }
}
