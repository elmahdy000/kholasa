import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const body = await req.json();
    const { isCompleted, progressPercent = 100 } = body;

    const progress = await prisma.studentProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      update: {
        isCompleted: isCompleted !== undefined ? isCompleted : true,
        progressPercent: progressPercent ?? 100,
        lastAccessedAt: new Date(),
      },
      create: {
        userId: user.id,
        lessonId,
        isCompleted: isCompleted !== undefined ? isCompleted : true,
        progressPercent: progressPercent ?? 100,
        lastAccessedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Failed to update lesson progress:", error);
    return NextResponse.json(
      { error: "تعذر تحديث تقدم الدرس" },
      { status: 500 }
    );
  }
}
