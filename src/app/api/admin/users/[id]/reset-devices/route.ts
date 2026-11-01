import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UserService } from "@/services/user.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const result = await UserService.resetUserDevices(id, currentUser.role);

    return NextResponse.json({
      success: true,
      message: "تم فك ربط أجهزة الطالب بنجاح وإلغاء الجلسات النشطة",
      user: result,
    });
  } catch (error) {
    console.error("Failed to reset student devices:", error);
    const msg = error instanceof Error ? error.message : "";
    const isForbidden = msg.includes("غير مصرح");
    const isNotFound = msg.includes("غير موجود");
    return NextResponse.json(
      { error: msg || "تعذر إعادة ضبط أجهزة المستخدم" },
      { status: isForbidden ? 403 : isNotFound ? 404 : 400 }
    );
  }
}

