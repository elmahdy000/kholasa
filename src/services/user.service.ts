import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export interface UserFilterParams {
  role?: Role | "ALL";
  search?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  /**
   * List users with role filtering, search, and pagination
   */
  static async getUsers(params: UserFilterParams = {}) {
    const { role, search, page = 1, limit = 20 } = params;

    const where: any = {};
    if (role && role !== "ALL") where.role = role;

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
   * Update user role with authorization hierarchy checks
   */
  static async updateUserRole(targetUserId: string, newRole: Role, actorRole: string) {
    if (actorRole !== Role.SUPER_ADMIN && actorRole !== Role.ADMIN) {
      throw new Error("غير مصرح لك بتعديل الرتب");
    }

    // Only SUPER_ADMIN can assign or modify SUPER_ADMIN or ADMIN roles
    if ((newRole === Role.SUPER_ADMIN || newRole === Role.ADMIN) && actorRole !== Role.SUPER_ADMIN) {
      throw new Error("فقط المشرف العام يمكنه ترقية المستخدمين إلى رتبة مسؤول");
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, name: true, role: true },
    });
  }

  /**
   * Update student profile fields
   */
  static async updateStudentProfile(
    userId: string,
    data: { name?: string; gradeId?: string; systemId?: string; avatar?: string }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
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
  static async deleteUser(targetUserId: string, actorRole: string) {
    if (actorRole !== Role.SUPER_ADMIN && actorRole !== Role.ADMIN) {
      throw new Error("غير مصرح لك بحذف المستخدمين");
    }

    return prisma.user.delete({
      where: { id: targetUserId },
    });
  }
}
