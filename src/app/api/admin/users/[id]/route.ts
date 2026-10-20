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
    const body = await req.json();

    const updated = await UserService.updateUser(id, body, currentUser.role);
    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: error.message || "تعذر تحديث بيانات المستخدم" },
      { status: error.message?.includes("غير مصرح") ? 403 : 500 }
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
    await UserService.deleteUser(id, currentUser.role);

    return NextResponse.json({ success: true, message: "تم حذف المستخدم بنجاح" });
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: error.message || "تعذر حذف المستخدم" },
      { status: error.message?.includes("غير مصرح") || error.message?.includes("المشرف العام") ? 403 : 500 }
    );
  }
}
