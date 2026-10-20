import { NextResponse } from "next/server";
import { getCurrentUser, canManageCurriculum } from "@/lib/auth";
import { CurriculumService } from "@/services/curriculum.service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { entity, id, isPublished } = body;

    if (!entity || !id || typeof isPublished !== "boolean") {
      return NextResponse.json({ error: "بيانات ناقصة أو غير صحيحة" }, { status: 400 });
    }

    await CurriculumService.toggleEntityPublish(entity, id, isPublished);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to toggle curriculum status:", error);
    const msg = error?.message || "";
    const isNotFound = msg.includes("غير موجود");
    return NextResponse.json(
      { error: msg || "تعذر تحديث حالة النشر" },
      { status: isNotFound ? 404 : 400 }
    );
  }
}
