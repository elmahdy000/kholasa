import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { UserFilterParams } from "./types";

export class UserQueriesService {
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
}
