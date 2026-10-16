import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";

// GET: List lessons for a unit or search
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");

    const where: any = {};
    if (unitId) where.unitId = unitId;

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        content: { select: { videoUrl: true, audioUrl: true } },
        mindMap: { select: { images: true } },
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("Failed to fetch admin lessons:", error);
    return NextResponse.json({ error: "تعذر تحميل قائمة الدروس" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json();
    const {
      unitId,
      title,
      durationMinutes,
      order,
      isPublished,
      videoUrl,
      audioUrl,
      bodyText,
      objectives,
      images,
    } = body;

    if (!unitId || !title?.trim()) {
      return NextResponse.json({ error: "يرجى تحديد الوحدة وعنوان الدرس" }, { status: 400 });
    }

    // Determine order if not specified
    let lessonOrder = order;
    if (lessonOrder === undefined || lessonOrder === null) {
      const highest = await prisma.lesson.findFirst({
        where: { unitId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      lessonOrder = (highest?.order ?? -1) + 1;
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: title.trim(),
        unitId,
        order: Number(lessonOrder),
        durationMinutes: Number(durationMinutes || 15),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        content: {
          create: {
            body: bodyText?.trim() || "محتوى وشرح تفصيلي للدرس...",
            videoUrl: videoUrl?.trim() || null,
            audioUrl: audioUrl?.trim() || null,
            objectives: Array.isArray(objectives) ? objectives : [],
          },
        },
        mindMap: {
          create: {
            title: `خريطة: ${title.trim()}`,
            images: Array.isArray(images) ? images : [],
            nodes: [],
            edges: [],
          },
        },
        summary: {
          create: {
            keyConcepts: [],
            definitions: [],
            formulas: [],
            comparisons: [],
            examTips: [],
            commonMistakes: [],
            checklist: [],
          },
        },
      },
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

    return NextResponse.json({ success: true, lesson });
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return NextResponse.json({ error: "تعذر إنشاء الدرس" }, { status: 500 });
  }
}
