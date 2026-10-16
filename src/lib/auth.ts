import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "kholasa_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      sessionToken: token,
      userId,
      expires,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      await prisma.session.delete({ where: { sessionToken: token } });
    } catch {
      // Ignore if session already deleted
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            avatar: true,
            gradeId: true,
            systemId: true,
            system: { select: { id: true, name: true, code: true } },
            grade: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (!session || session.expires < new Date()) {
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// Role groups
export const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.SUPER_ADMIN];
export const STAFF_ROLES: Role[] = [Role.TEACHER, Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN];
export const CONTENT_ROLES: Role[] = [Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN];
export const GRADING_ROLES: Role[] = [Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN];
export const EXAM_ROLES: Role[] = [Role.TEACHER, Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN];

// Permission checks for admin & subadmin roles
export function isStaff(role?: string | null): boolean {
  if (!role) return false;
  return ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"].includes(role);
}

export function canManageCurriculum(role?: string | null): boolean {
  if (!role) return false;
  return ["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(role);
}

export function canManageQuestions(role?: string | null): boolean {
  if (!role) return false;
  return ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"].includes(role);
}

export function canManageExams(role?: string | null): boolean {
  if (!role) return false;
  return ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"].includes(role);
}

export function canGradeAttempts(role?: string | null): boolean {
  if (!role) return false;
  return ["TEACHER", "ADMIN", "SUPER_ADMIN"].includes(role);
}

export function canManageMedia(role?: string | null): boolean {
  if (!role) return false;
  return ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"].includes(role);
}

export function canManageUsers(role?: string | null): boolean {
  if (!role) return false;
  return ["ADMIN", "SUPER_ADMIN"].includes(role);
}

export function canManageStructure(role?: string | null): boolean {
  if (!role) return false;
  return ["ADMIN", "SUPER_ADMIN"].includes(role);
}

export function canViewAnalytics(role?: string | null): boolean {
  if (!role) return false;
  return ["TEACHER", "ADMIN", "SUPER_ADMIN"].includes(role);
}

export async function requireAdmin() {
  return requireRole(ADMIN_ROLES);
}

export async function requireStaff() {
  return requireRole(STAFF_ROLES);
}
