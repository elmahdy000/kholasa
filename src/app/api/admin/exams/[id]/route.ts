import { NextResponse } from "next/server";
import { getCurrentUser, canManageExams } from "@/lib/auth";
import { ExamService } from "@/services";

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
    const exam = await ExamService.getExamById(id);

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

    const updated = await ExamService.updateExam(id, {
      isPractice,
      title,
      durationMinutes,
      description,
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
    await ExamService.deleteExam(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete exam:", error);
    return NextResponse.json({ error: "تعذر حذف الامتحان" }, { status: 500 });
  }
}
