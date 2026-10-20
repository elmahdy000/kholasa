import { NextResponse } from "next/server";
import { getCurrentUser, canManageCurriculum } from "@/lib/auth";
import { CurriculumService } from "@/services/curriculum.service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { entity, id, isPublished } = body;

    if (!entity || !id) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    await CurriculumService.toggleEntityPublish(entity, id, isPublished);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to toggle curriculum status:", error);
    return NextResponse.json(
      { error: error.message || "تعذر تحديث حالة النشر" },
      { status: 500 }
    );
  }
}
