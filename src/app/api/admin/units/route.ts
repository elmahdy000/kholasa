import { NextResponse } from "next/server";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";
import { CurriculumService } from "@/services";

// GET: List units by subjectId
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId") || undefined;

    const units = await CurriculumService.getUnits(subjectId);
    return NextResponse.json({ units });
  } catch (error) {
    console.error("Failed to fetch units:", error);
    return NextResponse.json({ error: "تعذر تحميل قائمة الوحدات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json();
    const { subjectId, title, description, order, isPublished } = body;

    if (!subjectId || !title?.trim()) {
      return NextResponse.json({ error: "يرجى تحديد المادة وعنوان الوحدة" }, { status: 400 });
    }

    const unit = await CurriculumService.createUnit({
      subjectId,
      title,
      description,
      order,
      isPublished,
    });

    return NextResponse.json({ success: true, unit });
  } catch (error) {
    console.error("Failed to create unit:", error);
    return NextResponse.json({ error: "تعذر إنشاء الوحدة" }, { status: 500 });
  }
}
