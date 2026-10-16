import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageExams } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageExams(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              include: {
                options: { orderBy: { order: "asc" } },
                explanation: true,
                rubric: true,
              },
            },
          },
        },
        attempts: {
          take: 10,
          orderBy: { startedAt: "desc" },
          select: {
            id: true,
            score: true,
            percentage: true,
            timeSpentSeconds: true,
            isCompleted: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "الامتحان غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (error) {
    console.error("Failed to fetch exam:", error);
    return NextResponse.json({ error: "تعذر تحميل بيانات الامتحان" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageExams(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isPractice, title, durationMinutes, description } = body;

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        ...(isPractice !== undefined ? { isPractice: Boolean(isPractice) } : {}),
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(durationMinutes !== undefined ? { durationMinutes: Number(durationMinutes) } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ success: true, exam: updated });
  } catch (error) {
    console.error("Failed to update exam:", error);
    return NextResponse.json({ error: "تعذر تحديث بيانات الامتحان" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageExams(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete exam:", error);
    return NextResponse.json({ error: "تعذر حذف الامتحان" }, { status: 500 });
  }
}
