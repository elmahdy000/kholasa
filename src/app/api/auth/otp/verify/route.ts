import { NextResponse } from "next/server";
import { OtpService } from "@/services/otp.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, token } = body;

    if (!identifier || !token) {
      return NextResponse.json(
        { error: "يرجى توفير المعرف ورمز التحقق" },
        { status: 400 }
      );
    }

    const result = await OtpService.verifyOtp(identifier, token);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("OTP verify error:", err);
    return NextResponse.json(
      { error: err.message || "تعذر التحقق من الرمز" },
      { status: 400 }
    );
  }
}
