import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageUsers, hashPassword } from "@/lib/auth";
import { Role } from "@prisma/client";

// GET: List users with search and filters
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const systemId = searchParams.get("systemId");
    const gradeId = searchParams.get("gradeId");

    const where: any = {};
    if (role && role !== "all") where.role = role as Role;
    if (systemId && systemId !== "all") where.systemId = systemId;
    if (gradeId && gradeId !== "all") where.gradeId = gradeId;

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        system: { select: { id: true, name: true } },
        grade: { select: { id: true, name: true } },
        attempts: {
          select: { id: true, score: true, percentage: true },
        },
        progress: { select: { id: true, isCompleted: true } },
      },
    });

    return NextResponse.json({ users });
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
    const { name, phone, email, password, role = "STUDENT", systemId, gradeId } = body;

    // Validate inputs
    if (!name?.trim()) {
      return NextResponse.json({ error: "اسم المستخدم مطلوب" }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: "رقم الهاتف مطلوب" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن لا تقل عن 6 أحرف" },
        { status: 400 }
      );
    }

    // Role restrictions: Only SUPER_ADMIN can create SUPER_ADMIN
    if (role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "لا يمكنك تعيين رتبة مشرف عام أعلى" },
        { status: 403 }
      );
    }

    const validRoles = Object.values(Role);
    if (!validRoles.includes(role as Role)) {
      return NextResponse.json({ error: "الرتبة المحددة غير صالحة" }, { status: 400 });
    }

    // Check phone uniqueness
    const cleanPhone = phone.trim();
    const existingPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { error: "رقم الهاتف مسجل بالفعل لمستخدم آخر" },
        { status: 400 }
      );
    }

    // Check email uniqueness if provided
    let cleanEmail: string | undefined = undefined;
    if (email && typeof email === "string" && email.trim()) {
      cleanEmail = email.trim().toLowerCase();
      const existingEmail = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مسجل بالفعل لمستخدم آخر" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail || null,
        password: hashedPassword,
        role: role as Role,
        systemId: systemId || null,
        gradeId: gradeId || null,
      },
      include: {
        system: { select: { id: true, name: true } },
        grade: { select: { id: true, name: true } },
        attempts: { select: { id: true, score: true, percentage: true } },
        progress: { select: { id: true, isCompleted: true } },
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: currentUser.id,
          action: "CREATE_USER",
          resource: "User",
          resourceId: newUser.id,
          details: {
            createdUserRole: newUser.role,
            createdUserName: newUser.name,
            createdUserPhone: newUser.phone,
          },
        },
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { error: "تعذر إنشاء الحساب، يرجى مراجعة البيانات المدخلة" },
      { status: 500 }
    );
  }
}
