import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UserService } from "@/services/user.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const updated = await UserService.updateUser(
      id,
      body,
      currentUser.role,
      currentUser.id
    );
    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Failed to update user:", error);
    const msg = error instanceof Error ? error.message : "";
    const isConflict = msg.includes("مسجل بالفعل");
    const isForbidden = msg.includes("غير مصرح");
    const isNotFound = msg.includes("غير موجود");
    return NextResponse.json(
      { error: msg || "تعذر تحديث بيانات المستخدم" },
      { status: isForbidden ? 403 : isConflict ? 409 : isNotFound ? 404 : 400 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    await UserService.deleteUser(id, currentUser.role, currentUser.id);

    return NextResponse.json({ success: true, message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    const msg = error instanceof Error ? error.message : "";
    const isForbidden = msg.includes("غير مصرح") || msg.includes("المشرف العام");
    const isBadRequest = msg.includes("حسابك الشخصي") || msg.includes("غير موجود");
    return NextResponse.json(
      { error: msg || "تعذر حذف المستخدم" },
      { status: isForbidden ? 403 : isBadRequest ? 400 : 500 }
    );
  }
}
