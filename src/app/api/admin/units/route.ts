import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";

// GET: List units by subjectId
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;

    const units = await prisma.unit.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        lessons: { orderBy: { order: "asc" } },
        _count: { select: { questions: true } },
      },
    });

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

    // Determine order if not specified
    let unitOrder = order;
    if (unitOrder === undefined || unitOrder === null) {
      const highest = await prisma.unit.findFirst({
        where: { subjectId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      unitOrder = (highest?.order ?? -1) + 1;
    }

    const unit = await prisma.unit.create({
      data: {
        subjectId,
        title: title.trim(),
        description: description?.trim() || null,
        order: Number(unitOrder),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
      include: {
        lessons: true,
      },
    });

    return NextResponse.json({ success: true, unit });
  } catch (error) {
    console.error("Failed to create unit:", error);
    return NextResponse.json({ error: "تعذر إنشاء الوحدة" }, { status: 500 });
  }
}
