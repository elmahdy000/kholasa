import { NextResponse } from "next/server";
import { z } from "zod";
import { OtpService } from "@/services/otp.service";
import { otpTypeSchema } from "@/lib/validation/auth";
import { jsonError, parseJson } from "@/lib/http";
import { getClientIp, rateLimit, withRetryAfter } from "@/lib/rate-limit";

const sendSchema = z.object({
  identifier: z
    .string({ error: "يرجى إدخال البريد الإلكتروني أو رقم الهاتف المسجل" })
    .trim()
    .min(3, "يرجى إدخال البريد الإلكتروني أو رقم الهاتف المسجل")
    .max(254),
  type: otpTypeSchema.default("PASSWORD_RESET"),
});

export async function POST(req: Request) {
  try {
    rateLimit(`otp-send:ip:${getClientIp(req)}`, 10, 60 * 60 * 1000);
    const { identifier, type } = await parseJson(req, sendSchema);
    const result = await OtpService.sendOtp(identifier, type);
    return NextResponse.json(result);
  } catch (err) {
    return withRetryAfter(jsonError(err), err);
  }
}
