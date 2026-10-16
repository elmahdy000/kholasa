import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            subject: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        content: true,
        summary: true,
        mindMap: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Failed to fetch lesson for admin:", error);
    return NextResponse.json({ error: "تعذر تحميل بيانات الدرس" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const {
      title,
      order,
      durationMinutes,
      isPublished,
      content,
      mindMap,
      summary,
    } = body;

    // Update lesson core fields
    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
        ...(durationMinutes !== undefined ? { durationMinutes: Number(durationMinutes) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
      },
    });

    // Upsert lesson content if provided
    if (content) {
      await prisma.lessonContent.upsert({
        where: { lessonId: id },
        create: {
          lessonId: id,
          body: content.body || "",
          videoUrl: content.videoUrl || null,
          audioUrl: content.audioUrl || null,
          objectives: Array.isArray(content.objectives) ? content.objectives : [],
        },
        update: {
          body: content.body !== undefined ? content.body : undefined,
          videoUrl: content.videoUrl !== undefined ? (content.videoUrl || null) : undefined,
          audioUrl: content.audioUrl !== undefined ? (content.audioUrl || null) : undefined,
          objectives: Array.isArray(content.objectives) ? content.objectives : undefined,
        },
      });
    }

    // Upsert mind map if provided
    if (mindMap) {
      await prisma.mindMap.upsert({
        where: { lessonId: id },
        create: {
          lessonId: id,
          title: mindMap.title || updatedLesson.title,
          description: mindMap.description || null,
          images: Array.isArray(mindMap.images) ? mindMap.images : [],
          nodes: mindMap.nodes || [],
          edges: mindMap.edges || [],
        },
        update: {
          title: mindMap.title !== undefined ? mindMap.title : undefined,
          description: mindMap.description !== undefined ? (mindMap.description || null) : undefined,
          images: Array.isArray(mindMap.images) ? mindMap.images : undefined,
          nodes: mindMap.nodes !== undefined ? mindMap.nodes : undefined,
          edges: mindMap.edges !== undefined ? mindMap.edges : undefined,
        },
      });
    }

    // Upsert summary if provided
    if (summary) {
      await prisma.lessonSummary.upsert({
        where: { lessonId: id },
        create: {
          lessonId: id,
          keyConcepts: summary.keyConcepts || [],
          definitions: summary.definitions || [],
          formulas: summary.formulas || [],
          comparisons: summary.comparisons || [],
          examTips: summary.examTips || [],
          commonMistakes: summary.commonMistakes || [],
          checklist: summary.checklist || [],
        },
        update: {
          keyConcepts: summary.keyConcepts !== undefined ? summary.keyConcepts : undefined,
          definitions: summary.definitions !== undefined ? summary.definitions : undefined,
          formulas: summary.formulas !== undefined ? summary.formulas : undefined,
          comparisons: summary.comparisons !== undefined ? summary.comparisons : undefined,
          examTips: summary.examTips !== undefined ? summary.examTips : undefined,
          commonMistakes: summary.commonMistakes !== undefined ? summary.commonMistakes : undefined,
          checklist: summary.checklist !== undefined ? summary.checklist : undefined,
        },
      });
    }

    const fullLesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            subject: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        content: true,
        summary: true,
        mindMap: true,
      },
    });

    return NextResponse.json({
      success: true,
      lesson: fullLesson,
    });
  } catch (error) {
    console.error("Failed to update lesson:", error);
    return NextResponse.json({ error: "تعذر حفظ تعديلات الدرس" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.lesson.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "تم حذف الدرس بنجاح" });
  } catch (error) {
    console.error("Failed to delete lesson:", error);
    return NextResponse.json({ error: "تعذر حذف الدرس" }, { status: 500 });
  }
}
