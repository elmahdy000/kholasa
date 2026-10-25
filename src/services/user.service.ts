import { prisma } from "@/lib/prisma";
import { Role, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

export interface UserFilterParams {
  role?: Role | "ALL";
  search?: string;
  systemId?: string;
  gradeId?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  /**
   * List users with role filtering, search, and pagination
   */
  static async getUsers(params: UserFilterParams = {}) {
    const { role, search, systemId, gradeId, page = 1, limit = 20 } = params;

    const where: Prisma.UserWhereInput = {};
    if (role && role !== "ALL") where.role = role;
    if (systemId && systemId !== "all") where.systemId = systemId;
    if (gradeId && gradeId !== "all") where.gradeId = gradeId;

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim() } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
          grade: { select: { id: true, name: true } },
          system: { select: { id: true, name: true } },
          _count: { select: { attempts: true, progress: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single user by ID
   */
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        grade: true,
        system: true,
        _count: { select: { attempts: true, progress: true, mistakes: true } },
      },
    });
  }

  /**
   * Create a new user or administrative staff
   */
  static async createUser(
    data: {
      name: string;
      phone: string;
      email?: string | null;
      password: string;
      role?: Role;
      systemId?: string | null;
      gradeId?: string | null;
    },
    actorRole: string
  ) {
    if (actorRole !== Role.SUPER_ADMIN && actorRole !== Role.ADMIN) {
      throw new Error("غير مصرح لك بإنشاء مستخدمين");
    }

    const { name, phone, email, password, role = Role.STUDENT, systemId, gradeId } = data;

    if (!name?.trim()) throw new Error("اسم المستخدم مطلوب");
    if (!phone?.trim()) throw new Error("رقم الهاتف مطلوب");
    if (!password || password.length < 8) throw new Error("كلمة المرور يجب أن لا تقل عن 8 أحرف");

    // Only a SUPER_ADMIN may create administrative accounts.
    if (
      (role === Role.SUPER_ADMIN || role === Role.ADMIN) &&
      actorRole !== Role.SUPER_ADMIN
    ) {
      throw new Error("فقط المشرف العام يمكنه إنشاء حسابات المسؤولين");
    }

    const cleanPhone = phone.trim();
    const existingPhone = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (existingPhone) throw new Error("رقم الهاتف مسجل بالفعل لمستخدم آخر");

    let cleanEmail: string | undefined = undefined;
    if (email && typeof email === "string" && email.trim()) {
      cleanEmail = email.trim().toLowerCase();
      const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingEmail) throw new Error("البريد الإلكتروني مسجل بالفعل لمستخدم آخر");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    return prisma.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail || null,
        password: hashedPassword,
        role,
        systemId: systemId || null,
        gradeId: gradeId || null,
      },
      include: {
        system: { select: { id: true, name: true } },
        grade: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Update full user profile or staff assignment
   */
  static async updateUser(
    id: string,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      role?: Role;
      systemId?: string | null;
      gradeId?: string | null;
    },
    actorRole: string,
    actorUserId?: string
  ) {
    if (actorRole !== Role.SUPER_ADMIN && actorRole !== Role.ADMIN) {
      throw new Error("غير مصرح لك بالوصول");
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) throw new Error("المستخدم غير موجود");

    if (targetUser.role === Role.SUPER_ADMIN && actorRole !== Role.SUPER_ADMIN) {
      throw new Error("لا يمكن تعديل صلاحيات المشرف العام الأعلى");
    }

    if (data.role !== undefined) {
      if (id === actorUserId) {
        throw new Error("لا يمكنك تغيير رتبتك بنفسك");
      }
      if (
        (data.role === Role.SUPER_ADMIN || data.role === Role.ADMIN) &&
        actorRole !== Role.SUPER_ADMIN
      ) {
        throw new Error("فقط المشرف العام يمكنه منح رتبة مسؤول");
      }
    }

    if (data.phone !== undefined && data.phone.trim()) {
      const cleanPhone = data.phone.trim();
      const existingPhone = await prisma.user.findFirst({
        where: { phone: cleanPhone, NOT: { id } },
      });
      if (existingPhone) throw new Error("رقم الهاتف مسجل بالفعل لمستخدم آخر");
    }

    if (data.email !== undefined && data.email.trim()) {
      const cleanEmail = data.email.trim().toLowerCase();
      const existingEmail = await prisma.user.findFirst({
        where: { email: cleanEmail, NOT: { id } },
      });
      if (existingEmail) throw new Error("البريد الإلكتروني مسجل بالفعل لمستخدم آخر");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
        ...(data.email !== undefined ? { email: data.email.trim().toLowerCase() } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
        ...(data.systemId !== undefined ? { systemId: data.systemId || null } : {}),
        ...(data.gradeId !== undefined ? { gradeId: data.gradeId || null } : {}),
      },
      include: {
        system: { select: { id: true, name: true } },
        grade: { select: { id: true, name: true } },
      },
    });

    // A role change must not keep old privileges alive in existing sessions.
    if (data.role !== undefined && data.role !== targetUser.role) {
      await prisma.session.deleteMany({ where: { userId: id } });
    }

    return updated;
  }

  /**
   * Update user role with authorization hierarchy checks
   */
  static async updateUserRole(
    targetUserId: string,
    newRole: Role,
    actorRole: string,
    actorUserId?: string
  ) {
    if (actorRole !== Role.SUPER_ADMIN && actorRole !== Role.ADMIN) {
      throw new Error("غير مصرح لك بتعديل الرتب");
    }

    if (actorUserId && targetUserId === actorUserId) {
      throw new Error("لا يمكنك تغيير رتبتك بنفسك");
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    });
    if (!target) throw new Error("المستخدم غير موجود");

    if (
      (newRole === Role.SUPER_ADMIN || newRole === Role.ADMIN) &&
      actorRole !== Role.SUPER_ADMIN
    ) {
      throw new Error("فقط المشرف العام يمكنه منح رتبة مسؤول");
    }

    if (target.role === Role.SUPER_ADMIN && actorRole !== Role.SUPER_ADMIN) {
      throw new Error("لا يمكن تعديل صلاحيات المشرف العام الأعلى");
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, name: true, role: true },
    });

    if (target.role !== newRole) {
      await prisma.session.deleteMany({ where: { userId: targetUserId } });
    }

    return updated;
  }

  /**
   * Update student profile fields
   */
  static async updateStudentProfile(
    userId: string,
    data: { name?: string; phone?: string; gradeId?: string; systemId?: string; avatar?: string }
  ) {
    if (data.phone !== undefined && data.phone?.trim()) {
      const cleanPhone = data.phone.trim();
      const existingPhone = await prisma.user.findFirst({
        where: { phone: cleanPhone, NOT: { id: userId } },
      });
      if (existingPhone) throw new Error("رقم الهاتف مسجل بالفعل لمستخدم آخر");
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        phone: data.phone !== undefined ? (data.phone ? data.phone.trim() : null) : undefined,
        gradeId: data.gradeId !== undefined ? data.gradeId : undefined,
        systemId: data.systemId !== undefined ? data.systemId : undefined,
        avatar: data.avatar !== undefined ? data.avatar : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gradeId: true,
        systemId: true,
        avatar: true,
      },
    });
  }

  /**
   * Delete user account with permission check
   */
  static async deleteUser(targetUserId: string, actorRole: string, actorUserId?: string) {
    if (actorRole !== Role.SUPER_ADMIN && actorRole !== Role.ADMIN) {
      throw new Error("غير مصرح لك بحذف المستخدمين");
    }

    if (actorUserId && targetUserId === actorUserId) {
      throw new Error("لا يمكنك حذف حسابك الشخصي أثناء تسجيل الدخول");
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    });

    if (!targetUser) {
      throw new Error("المستخدم المراد حذفه غير موجود");
    }

    if (
      (targetUser.role === Role.SUPER_ADMIN || targetUser.role === Role.ADMIN) &&
      actorRole !== Role.SUPER_ADMIN
    ) {
      throw new Error("فقط المشرف العام يملك صلاحية حذف حسابات المسؤولين");
    }

    return prisma.user.delete({
      where: { id: targetUserId },
    });
  }

  /**
   * Find user by email or phone (case-insensitive for email)
   */
  static async findByIdentifier(identifier: string) {
    const clean = identifier.trim();
    return prisma.user.findFirst({
      where: {
        OR: [
          { phone: clean },
          { email: { equals: clean.toLowerCase(), mode: "insensitive" } },
        ],
      },
    });
  }

  /**
   * Register a new student user
   */
  static async registerStudent(data: {
    name: string;
    phone?: string | null;
    email?: string | null;
    password: string;
    systemId?: string | null;
    gradeId?: string | null;
  }) {
    const { name, phone, email, password, systemId, gradeId } = data;

    const cleanPhone = phone && phone.trim() ? phone.trim() : null;
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null;

    if (!cleanPhone && !cleanEmail) {
      throw new Error("يرجى إدخال البريد الإلكتروني أو رقم الهاتف");
    }

    const orConditions = [];
    if (cleanPhone) orConditions.push({ phone: cleanPhone });
    if (cleanEmail) orConditions.push({ email: cleanEmail });

    const existing = await prisma.user.findFirst({
      where: { OR: orConditions },
    });

    if (existing) {
      throw new Error("رقم الهاتف أو البريد الإلكتروني مسجل بالفعل");
    }

    // Validate the academic selection and derive the system from the grade so
    // the two can never disagree.
    let resolvedSystemId = systemId || null;
    if (gradeId) {
      const grade = await prisma.grade.findUnique({
        where: { id: gradeId },
        select: { systemId: true, system: { select: { isActive: true } } },
      });
      if (!grade || !grade.system.isActive) {
        throw new Error("الصف الدراسي غير متاح");
      }
      if (systemId && grade.systemId !== systemId) {
        throw new Error("الصف لا ينتمي إلى النظام التعليمي المحدد");
      }
      resolvedSystemId = grade.systemId;
    } else if (systemId) {
      const system = await prisma.educationalSystem.findUnique({
        where: { id: systemId },
        select: { isActive: true },
      });
      if (!system || !system.isActive) {
        throw new Error("النظام التعليمي غير متاح");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    return prisma.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        password: hashedPassword,
        systemId: resolvedSystemId,
        gradeId: gradeId || null,
        role: Role.STUDENT,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        systemId: true,
        gradeId: true,
      },
    });
  }
}

