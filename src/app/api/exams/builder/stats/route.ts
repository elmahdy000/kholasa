import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, subjectScopeWhere } from "@/lib/curriculum";
import { ExamService } from "@/services";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId") || undefined;
    const unitId = searchParams.get("unitId") || undefined;
    const lessonIds = searchParams.get("lessonIds")?.split(",").filter(Boolean);
    const type = searchParams.get("type") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;

    if (!subjectId) {
      return NextResponse.json({ count: 0 });
    }

    // Never count questions from another grade/track.
    const scope = getCurriculumScope(user);
    if (scope) {
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, isPublished: true, ...subjectScopeWhere(scope) },
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
