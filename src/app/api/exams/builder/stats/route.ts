import { NextResponse } from "next/server";
import { ExamService } from "@/services";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId") || undefined;
    const unitId = searchParams.get("unitId") || undefined;
    const lessonIds = searchParams.get("lessonIds")?.split(",").filter(Boolean);
    const type = searchParams.get("type") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;

    if (!subjectId) {
      return NextResponse.json({ count: 0 });
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
