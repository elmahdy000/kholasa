import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const unitId = searchParams.get("unitId");
    const lessonIds = searchParams.get("lessonIds")?.split(",").filter(Boolean);
    const type = searchParams.get("type");
    const difficulty = searchParams.get("difficulty");

    if (!subjectId) {
      return NextResponse.json({ count: 0 });
    }

    const where: any = {
      status: "PUBLISHED",
      subjectId,
    };

    if (unitId && unitId !== "all") {
      where.unitId = unitId;
    }

    if (lessonIds && lessonIds.length > 0) {
      where.lessons = {
        some: {
          lessonId: { in: lessonIds },
        },
      };
    }

    if (type && type !== "ALL" && type !== "MIXED") {
      where.type = type;
    }

    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty;
    }

    const count = await prisma.question.count({ where });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Failed to get question count:", error);
    return NextResponse.json({ count: 0 });
  }
}
