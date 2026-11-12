import { prisma } from "@/lib/prisma";
import { Role, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateUniqueLoginCode } from "@/lib/auth";
import {
  canActorAssignUserRole,
  canActorManageTargetUser,
  canDeleteUsersRole,
  canManageUsersRole,
} from "@/lib/roles";
import type {
  CreateUserInput,
  UpdateUserInput,
  StudentProfileUpdateInput,
  RegisterStudentInput,
} from "./types";

export class UserMutationsService {
  /**
   * Create a new user or administrative staff
   */
  static async createUser(data: CreateUserInput, actorRole: string) {
    if (!canManageUsersRole(actorRole)) {
      throw new Error("غير مصرح لك بإنشاء مستخدمين");
    }

    const { name, phone, email, password, role = Role.STUDENT, systemId, gradeId, schoolCategory } = data;

    if (!name?.trim()) throw new Error("اسم المستخدم مطلوب");

    if (!canActorAssignUserRole(actorRole, role)) {
      throw new Error(
        role === Role.SUPER_ADMIN
          ? "فقط المشرف العام الأعلى يمكنه إنشاء حساب مشرف عام"
          : "غير مصرح لك بإنشاء حساب بهذه الصلاحية"
      );
    }

    let cleanPhone: string | undefined = undefined;
    if (phone && phone.trim()) {
      cleanPhone = phone.trim();
      const existingPhone = await prisma.user.findUnique({ where: { phone: cleanPhone } });
      if (existingPhone) throw new Error("رقم الهاتف مسجل بالفعل لمستخدم آخر");
    }

    let cleanEmail: string | undefined = undefined;
    if (email && typeof email === "string" && email.trim()) {
      cleanEmail = email.trim().toLowerCase();
      const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingEmail) throw new Error("البريد الإلكتروني مسجل بالفعل لمستخدم آخر");
    }

    let finalLoginCode = data.loginCode?.trim().toUpperCase();
    if (!finalLoginCode && role === Role.STUDENT) {
      finalLoginCode = await generateUniqueLoginCode();
    } else if (finalLoginCode) {
      const existingCode = await prisma.user.findUnique({ where: { loginCode: finalLoginCode } });
      if (existingCode) throw new Error("كود الدخول هذا مسجل بالفعل لطالب آخر");
    }

    if (role !== Role.STUDENT) {
      if (!cleanPhone && !cleanEmail) {
        throw new Error("يرجى إدخال البريد الإلكتروني أو رقم الهاتف لحساب الإدارة/المساعد");
      }
      if (!password || password.trim().length < 8) {
        throw new Error("كلمة المرور للطاقم الإداري يجب أن لا تقل عن 8 أحرف");
      }
    }

    const rawPassword = password?.trim() || finalLoginCode || "Kholasa@2026";
    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    const initialMaxDevices = typeof data.maxDevices === "number" && data.maxDevices > 0 ? data.maxDevices : 1;
    const isActive = data.isActive !== undefined ? data.isActive : true;
    const resolvedSubscriptionStatus =
      data.subscriptionStatus ??
      (role === Role.STUDENT
        ? isActive
          ? SubscriptionStatus.ACTIVE
          : SubscriptionStatus.TRIAL
        : undefined);

    return prisma.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone || null,
        email: cleanEmail || null,
        password: hashedPassword,
        loginCode: finalLoginCode || null,
        role,
        systemId: systemId || null,
        gradeId: gradeId || null,
        schoolCategory: schoolCategory || "ARABIC",
        maxDevices: initialMaxDevices,
        isActive,
        ...(resolvedSubscriptionStatus ? { subscriptionStatus: resolvedSubscriptionStatus } : {}),
        ...(data.studyMode ? { studyMode: data.studyMode } : {}),
        ...(data.centerName !== undefined ? { centerName: data.centerName || null } : {}),
      },
      select: {
        id: true, name: true, phone: true, email: true, loginCode: true, role: true,
        schoolCategory: true, systemId: true, gradeId: true, createdAt: true, isActive: true,
        maxDevices: true, boundDevices: true, studyMode: true, centerName: true,
        subscriptionStatus: true, paymentReceiptUrl: true, paymentUploadedAt: true, subscriptionExpiresAt: true,
        attempts: { select: { id: true, score: true, percentage: true } },
        progress: { select: { id: true, isCompleted: true } },
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
    data: UpdateUserInput,
    actorRole: string,
    actorUserId?: string
  ) {
    if (!canManageUsersRole(actorRole)) {
      throw new Error("غير مصرح لك بالوصول");
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) throw new Error("المستخدم غير موجود");

    if (!canActorManageTargetUser(actorRole, targetUser.role)) {
      throw new Error(
        targetUser.role === Role.SUPER_ADMIN
          ? "لا يمكن تعديل صلاحيات المشرف العام الأعلى"
          : "غير مصرح لك بتعديل حسابات الإدارة أو المساعدين"
      );
    }

    if (data.name !== undefined && !data.name.trim()) {
      throw new Error("اسم المستخدم مطلوب");
    }

    if (data.isActive === false && id === actorUserId) {
      throw new Error("لا يمكنك تعطيل حسابك الشخصي");
    }

    if (data.role !== undefined && data.role !== targetUser.role) {
      if (id === actorUserId) {
        throw new Error("لا يمكنك تغيير رتبتك بنفسك");
      }
      if (!canActorAssignUserRole(actorRole, data.role)) {
        throw new Error(
          data.role === Role.SUPER_ADMIN
            ? "فقط المشرف العام الأعلى يمكنه منح رتبة مشرف عام"
            : "غير مصرح لك بمنح هذه الرتبة"
        );
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

    if (data.loginCode !== undefined) {
      const cleanCode = data.loginCode.trim().toUpperCase() || null;
      if (cleanCode) {
        const existingCode = await prisma.user.findFirst({
          where: { loginCode: cleanCode, NOT: { id } },
        });
        if (existingCode) throw new Error("كود الدخول هذا مسجل بالفعل لطالب آخر");
      }
    }

    let hashedPassword: string | undefined = undefined;
    if (data.password !== undefined && data.password.trim()) {
      const cleanPassword = data.password.trim();
      if (cleanPassword.length < 8) {
        throw new Error("كلمة المرور يجب أن لا تقل عن 8 أحرف");
      }
      hashedPassword = await bcrypt.hash(cleanPassword, 12);
    }

    const nextEmail = data.email !== undefined ? data.email.trim().toLowerCase() : undefined;
    const nextPhone = data.phone !== undefined ? data.phone.trim() : undefined;

    const resultingRole = data.role ?? targetUser.role;
    const resultingPhone = nextPhone !== undefined ? (nextPhone || null) : targetUser.phone;
    const resultingEmail = nextEmail !== undefined ? (nextEmail || null) : targetUser.email;
    if (resultingRole !== Role.STUDENT && !resultingPhone && !resultingEmail) {
      throw new Error("يجب وجود بريد إلكتروني أو رقم هاتف لحساب الإدارة/المساعد");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(nextPhone !== undefined ? { phone: nextPhone || null } : {}),
        ...(nextEmail !== undefined ? { email: nextEmail || null } : {}),
        ...(resultingRole !== Role.STUDENT
          ? { loginCode: null }
          : data.loginCode !== undefined
            ? { loginCode: data.loginCode.trim().toUpperCase() || null }
            : {}),
        ...(hashedPassword ? { password: hashedPassword } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
        ...(data.systemId !== undefined ? { systemId: data.systemId || null } : {}),
        ...(data.gradeId !== undefined ? { gradeId: data.gradeId || null } : {}),
        ...(data.trackId !== undefined ? { trackId: data.trackId || null } : {}),
        ...(data.schoolCategory !== undefined ? { schoolCategory: data.schoolCategory } : {}),
        ...(typeof data.maxDevices === "number" && data.maxDevices > 0 ? { maxDevices: data.maxDevices } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.studyMode ? { studyMode: data.studyMode } : {}),
        ...(data.centerName !== undefined ? { centerName: data.centerName || null } : {}),
        ...(data.subscriptionStatus ? { subscriptionStatus: data.subscriptionStatus } : {}),
        ...(data.paymentReceiptUrl !== undefined ? { paymentReceiptUrl: data.paymentReceiptUrl } : {}),
        ...(data.paymentSenderPhone !== undefined ? { paymentSenderPhone: data.paymentSenderPhone } : {}),
        ...(data.paymentReference !== undefined ? { paymentReference: data.paymentReference } : {}),
        ...(data.subscriptionExpiresAt !== undefined ? { subscriptionExpiresAt: data.subscriptionExpiresAt ? new Date(data.subscriptionExpiresAt) : null } : {}),
      },
      select: {
        id: true, name: true, phone: true, email: true, loginCode: true, role: true,
        systemId: true, gradeId: true, trackId: true, schoolCategory: true, createdAt: true,
        maxDevices: true, boundDevices: true, isActive: true,
        studyMode: true, centerName: true, subscriptionStatus: true,
        paymentReceiptUrl: true, paymentSenderPhone: true, paymentReference: true,
        paymentUploadedAt: true, subscriptionExpiresAt: true,
        system: { select: { id: true, name: true } },
        grade: { select: { id: true, name: true } },
        track: { select: { id: true, name: true } },
      },
    });

    // A role, password, staff email change, or account deactivation must purge existing sessions.
    const staffEmailChanged =
      targetUser.role !== Role.STUDENT &&
      nextEmail !== undefined &&
      nextEmail !== (targetUser.email || "").toLowerCase();

    if (
      (data.role !== undefined && data.role !== targetUser.role) ||
      hashedPassword ||
      data.isActive === false ||
      staffEmailChanged
    ) {
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
    if (!canManageUsersRole(actorRole)) {
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

    if (!canActorAssignUserRole(actorRole, newRole)) {
      throw new Error(
        newRole === Role.SUPER_ADMIN
          ? "فقط المشرف العام الأعلى يمكنه منح رتبة مشرف عام"
          : "غير مصرح لك بمنح هذه الرتبة"
      );
    }

    if (!canActorManageTargetUser(actorRole, target.role)) {
      throw new Error(
        target.role === Role.SUPER_ADMIN
          ? "لا يمكن تعديل صلاحيات المشرف العام الأعلى"
          : "غير مصرح لك بتعديل صلاحيات الإدارة أو المساعدين"
      );
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
  static async updateStudentProfile(userId: string, data: StudentProfileUpdateInput) {
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
    if (!canDeleteUsersRole(actorRole)) {
      throw new Error("غير مصرح للمساعد بحذف الطلاب أو المستخدمين — هذه الصلاحية للإدارة فقط");
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
   * Reset bound devices for a student and purge active sessions
   */
  static async resetUserDevices(targetUserId: string, actorRole: string) {
    if (!canManageUsersRole(actorRole)) {
      throw new Error("غير مصرح لك بالوصول");
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new Error("المستخدم غير موجود");

    if (!canActorManageTargetUser(actorRole, targetUser.role)) {
      throw new Error("غير مصرح لك بتعديل حسابات الإدارة أو المساعدين");
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { boundDevices: [] },
      select: {
        id: true,
        name: true,
        maxDevices: true,
        boundDevices: true,
      },
    });

    await prisma.session.deleteMany({ where: { userId: targetUserId } });

    return updated;
  }

  /**
   * Register a new student user
   */
  static async registerStudent(data: RegisterStudentInput) {
    const { name, phone, email, password, systemId, gradeId, deviceId } = data;

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

    // Validate the academic selection and derive the system from the grade
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
        boundDevices: deviceId ? [deviceId] : [],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        systemId: true,
        gradeId: true,
        maxDevices: true,
        boundDevices: true,
      },
    });
  }
}
