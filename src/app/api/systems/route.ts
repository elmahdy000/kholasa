import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const systems = await prisma.educationalSystem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        grades: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ systems });
  } catch (error) {
    console.error("Failed to fetch systems:", error);
    return NextResponse.json(
      { error: "تعذر تحميل الأنظمة التعليمية" },
      { status: 500 }
    );
  }
}
