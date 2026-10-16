import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageCurriculum } from "@/lib/auth";

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

    if (entity === "subject") {
      await prisma.subject.update({
        where: { id },
        data: { isPublished: !!isPublished },
      });
    } else if (entity === "unit") {
      await prisma.unit.update({
        where: { id },
        data: { isPublished: !!isPublished },
      });
    } else if (entity === "lesson") {
      await prisma.lesson.update({
        where: { id },
        data: { isPublished: !!isPublished },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to toggle curriculum status:", error);
    return NextResponse.json(
      { error: "تعذر تحديث حالة النشر" },
      { status: 500 }
    );
  }
}
