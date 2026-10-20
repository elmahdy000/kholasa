import { NextResponse } from "next/server";
import { OtpService } from "@/services/otp.service";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, type } = body;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "يرجى إدخال البريد الإلكتروني أو رقم الهاتف المسجل" },
        { status: 400 }
      );
    }

    const result = await OtpService.sendOtp(identifier, type);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("OTP send error:", err);
    return NextResponse.json(
      { error: err.message || "تعذر إرسال رمز التحقق" },
      { status: 400 }
    );
  }
}
