import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, questionId } = body;

    if (!lessonId && !questionId) {
      return NextResponse.json(
        { error: "يجب تحديد درس أو سؤال لحفظه" },
        { status: 400 }
      );
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        ...(lessonId ? { lessonId } : {}),
        ...(questionId ? { questionId } : {}),
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, bookmarked: false });
    } else {
      const bookmark = await prisma.bookmark.create({
        data: {
          userId: user.id,
          lessonId: lessonId || null,
          questionId: questionId || null,
        },
      });
      return NextResponse.json({ success: true, bookmarked: true, bookmark });
    }
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
    return NextResponse.json(
      { error: "تعذر تحديث الإشارات المرجعية" },
      { status: 500 }
    );
  }
}
