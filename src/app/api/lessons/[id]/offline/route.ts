import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, unauthorized } from "@/lib/http";
import { OfflineService } from "@/services/offline.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw unauthorized("غير مصرح");
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "معرف الدرس مطلوب" }, { status: 400 });
    }

    const packageData = await OfflineService.generateLessonOfflinePackage(id, user);
    return NextResponse.json({ package: packageData });
  } catch (err) {
    return jsonError(err);
  }
}
