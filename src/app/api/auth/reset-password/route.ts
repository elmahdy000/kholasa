import { NextResponse } from "next/server";
import { OtpService } from "@/services/otp.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, resetToken, newPassword } = body;

    if (!identifier || !resetToken || !newPassword) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة لتغيير كلمة المرور" },
        { status: 400 }
      );
    }

    const result = await OtpService.resetPassword(identifier, resetToken, newPassword);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { error: err.message || "تعذر إعادة تعيين كلمة المرور" },
      { status: 400 }
    );
  }
}
