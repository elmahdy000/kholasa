import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { StudentService } from "@/services/student.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const bookmarks = await StudentService.getBookmarks(user.id);
    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    return NextResponse.json(
      { error: "تعذر جلب الإشارات المرجعية" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { lessonId, questionId } = body;

    if (!lessonId && !questionId) {
      return NextResponse.json(
        { error: "يجب تحديد درس أو سؤال لحفظه" },
        { status: 400 }
      );
    }

    const result = await StudentService.toggleBookmark(user.id, { lessonId, questionId });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Failed to toggle bookmark:", error);
    const msg = error?.message || "";
    if (msg.includes("غير موجود")) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    return NextResponse.json(
      { error: msg || "تعذر تحديث الإشارات المرجعية" },
      { status: 500 }
    );
  }
}
