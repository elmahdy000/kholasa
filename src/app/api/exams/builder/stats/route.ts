import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, subjectScopeWhere } from "@/lib/curriculum";
import { ExamService } from "@/services";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId") || undefined;
    const unitId = searchParams.get("unitId") || undefined;
    const lessonIds = searchParams.get("lessonIds")?.split(",").filter(Boolean);
    const type = searchParams.get("type") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;

    if (!subjectId) {
      return NextResponse.json({ count: 0 });
    }

    // Never count questions from another grade/track for scoped students.
    const scope = user ? getCurriculumScope(user) : null;
    if (scope) {
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, isPublished: true, ...subjectScopeWhere(scope) },
        select: { id: true },
      });
      if (!subject) {
        return NextResponse.json({ error: "المادة غير متاحة" }, { status: 404 });
      }
    } else {
      // Unscoped / guest: verify subject is published
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, isPublished: true },
        select: { id: true },
      });
      if (!subject) {
        return NextResponse.json({ error: "المادة غير متاحة" }, { status: 404 });
      }
    }

    const count = await ExamService.getExamBuilderStats({
      subjectId,
      unitId,
      lessonIds,
      type,
      difficulty,
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Failed to get question count:", error);
    return NextResponse.json({ count: 0 });
  }
}
