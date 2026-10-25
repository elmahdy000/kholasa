import { z } from "zod";

/** Password policy: 8+ chars, max 72 bytes (bcrypt limit), at least one letter and one digit. */
export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
  .refine((v) => Buffer.byteLength(v, "utf8") <= 72, "كلمة المرور طويلة جداً")
  .refine((v) => /\p{L}/u.test(v) && /\d/.test(v), "كلمة المرور يجب أن تحتوي على حرف ورقم على الأقل");

export const OTP_TYPES = ["PASSWORD_RESET", "VERIFICATION"] as const;
export const otpTypeSchema = z.enum(OTP_TYPES);
export type OtpType = z.infer<typeof otpTypeSchema>;
