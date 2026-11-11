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

/** Convert Arabic-Indic and Eastern Arabic numerals into standard ASCII digits and strip separators. */
export function normalizeDigits(raw: string): string {
  return raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\s\-().]/g, "")
    .trim();
}
