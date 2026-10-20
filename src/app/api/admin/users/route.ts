import { NextResponse } from "next/server";
import { getCurrentUser, canManageUsers } from "@/lib/auth";
import { UserService } from "@/services/user.service";

// GET: List users with search and filters
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const role = (searchParams.get("role") as any) || undefined;
    const systemId = searchParams.get("systemId") || undefined;
    const gradeId = searchParams.get("gradeId") || undefined;

    const { users, pagination } = await UserService.getUsers({
      role,
      search,
      systemId,
      gradeId,
      limit: 100,
    });

    return NextResponse.json({ users, pagination });
  } catch (error) {
    console.error("Failed to fetch users list:", error);
    return NextResponse.json(
      { error: "تعذر تحميل قائمة المستخدمين" },
      { status: 500 }
    );
  }
}

// POST: Create a new user or subadmin
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json();
    const newUser = await UserService.createUser(body, currentUser.role);

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { error: error.message || "تعذر إضافة المستخدم" },
      { status: 400 }
    );
  }
}
