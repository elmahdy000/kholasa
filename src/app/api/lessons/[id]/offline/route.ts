import { NextResponse } from "next/server";
import { OfflineService } from "@/services/offline.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "معرف الدرس مطلوب" }, { status: 400 });
    }

    const packageData = await OfflineService.generateLessonOfflinePackage(id);
    return NextResponse.json({ package: packageData });
  } catch (err: any) {
    console.error("Offline package error:", err);
    return NextResponse.json(
      { error: err.message || "تعذر تجهيز حزمة الدرس للعمل أوفلاين" },
      { status: 404 }
    );
  }
}
