import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, parseJson, unauthorized } from "@/lib/http";
import { StudentService } from "@/services/student.service";

const bodySchema = z
  .object({
    lessonId: z.string().min(1).optional(),
    questionId: z.string().min(1).optional(),
  })
  .refine((v) => Boolean(v.lessonId) !== Boolean(v.questionId), {
    message: "يجب تحديد درس واحد أو سؤال واحد فقط",
  });

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized("غير مصرح");

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 50;

    const bookmarks = await StudentService.getBookmarks(user.id, page, limit);
    return NextResponse.json({ bookmarks });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized("غير مصرح");

    const body = await parseJson(req, bodySchema);
    const result = await StudentService.toggleBookmark(user.id, body);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return jsonError(error);
  }
}
