import { AppError } from "@/lib/http";

export type OtpPurpose = "PASSWORD_RESET" | "VERIFICATION";

const isProd = () => process.env.NODE_ENV === "production";
const mode = () => (process.env.OTP_DELIVERY === "webhook" ? "webhook" : "console");

const UNAVAILABLE = "خدمة الرسائل غير مفعلة";

/** Delivers an OTP. Throws AppError(503) if delivery is unavailable (fail closed). */
export async function sendOtp(identifier: string, code: string, purpose: OtpPurpose): Promise<void> {
  if (mode() === "webhook") {
    const url = process.env.OTP_WEBHOOK_URL;
    if (!url) throw new AppError(503, UNAVAILABLE);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: identifier, code, purpose }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`webhook status ${res.status}`);
    } catch (e) {
      console.error("[OTP] webhook delivery failed:", e instanceof Error ? e.message : "unknown");
      throw new AppError(503, UNAVAILABLE);
    }
    return;
  }

  if (isProd()) {
    console.error(`[OTP] console delivery is not available in production (purpose=${purpose}, to=***)`);
    throw new AppError(503, UNAVAILABLE);
  }
  console.log(`[OTP:dev] ${purpose} code for ${identifier}: ${code}`);
}
