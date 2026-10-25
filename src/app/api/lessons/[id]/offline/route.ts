import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { OfflineService } from "@/services/offline.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "معرف الدرس مطلوب" }, { status: 400 });
    }

    const packageData = await OfflineService.generateLessonOfflinePackage(id);
    return NextResponse.json({ package: packageData });
  } catch (err) {
    console.error("Offline package error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "تعذر تجهيز حزمة الدرس للعمل أوفلاين" },
      { status: 404 }
    );
  }
}
