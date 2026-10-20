import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UserService } from "@/services/user.service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, phone, systemId, gradeId } = body;

    const updated = await UserService.updateStudentProfile(user.id, {
      name,
      phone,
      systemId,
      gradeId,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    const msg = error?.message || "";
    return NextResponse.json(
      { error: msg || "تعذر تحديث البيانات الشخصية" },
      { status: msg ? 400 : 500 }
    );
  }
}
