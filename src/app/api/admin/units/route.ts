import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
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
