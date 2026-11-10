import type { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  DEMO_SANDBOX_PREFIXES,
  DEMO_TEMPLATE_CODES,
  type DemoTemplateCode,
  isAnyDemoCode,
  isDemoSandboxCode,
  isDemoTemplateCode,
} from "@/lib/demo-shared";

export {
  DEMO_SANDBOX_PREFIXES,
  DEMO_TEMPLATE_CODES,
  type DemoTemplateCode,
  isAnyDemoCode,
  isDemoSandboxCode,
  isDemoTemplateCode,
};

/** Demo sessions remain valid for 24 hours on the visitor's browser, then auto-expire. */
export const DEMO_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Throttle background cleanup so expired demo sandbox accounts are purged
 * without adding extra DB pressure on every login.
 */
const CLEANUP_THROTTLE_MS = 10 * 60 * 1000;
let lastCleanupAt = 0;

export function generateDemoSandboxLoginCode(templateCode: DemoTemplateCode): string {
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `${templateCode}-${suffix}`;
}

export function getDemoTemplateDefaults(code: DemoTemplateCode) {
  if (code === "DEMO-AR") {
    return {
      name: "طالب تجريبي (عربي)",
      schoolCategory: "ARABIC" as const,
      subscriptionStatus: "TRIAL" as const,
      defaultCenter: "سنتر رافال عربي",
    };
  }
  if (code === "DEMO-PRO") {
    return {
      name: "طالب تجريبي (اشتراك مفعل)",
      schoolCategory: "LANGUAGES" as const,
      subscriptionStatus: "ACTIVE" as const,
      defaultCenter: "سنتر إديوفيرس لغات",
    };
  }
  return {
    name: "طالب تجريبي (لغات)",
    schoolCategory: "LANGUAGES" as const,
    subscriptionStatus: "TRIAL" as const,
    defaultCenter: "سنتر إديوفيرس لغات",
  };
}

/**
 * Reusable Prisma filter that excludes ephemeral per-visitor demo sandbox rows
 * from admin user tables, leaderboards, and global cohort analytics while
 * safely preserving rows where `loginCode` is NULL.
 */
export const EXCLUDE_DEMO_SANDBOX_CONDITION: Prisma.UserWhereInput = {
  OR: [
    { loginCode: null },
    {
      AND: [
        { loginCode: { not: { startsWith: "DEMO-AR-" } } },
        { loginCode: { not: { startsWith: "DEMO-EN-" } } },
        { loginCode: { not: { startsWith: "DEMO-PRO-" } } },
      ],
    },
  ],
};

/**
 * Immediately deletes a single ephemeral demo sandbox user (e.g. on explicit logout),
 * along with any custom exams they generated during their demo session.
 */
export async function purgeDemoSandboxUser(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, loginCode: true },
    });

    if (!user || user.role !== "STUDENT" || !isDemoSandboxCode(user.loginCode)) {
      return;
    }

    await prisma.exam.deleteMany({
      where: { isCustom: true, createdById: user.id },
    });

    await prisma.user.delete({
      where: { id: user.id },
    });
  } catch (err) {
    console.warn("Non-fatal error purging demo sandbox user:", err);
  }
}

/**
 * Purges expired demo sandbox accounts (created >24h ago with no active session).
 */
export async function cleanupExpiredDemoSandboxes(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastCleanupAt < CLEANUP_THROTTLE_MS) {
    return;
  }
  lastCleanupAt = now;

  try {
    const cutoff = new Date(now - DEMO_SESSION_TTL_MS);
    const expiredUsers = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        createdAt: { lt: cutoff },
        OR: DEMO_SANDBOX_PREFIXES.map((prefix) => ({
          loginCode: { startsWith: prefix },
        })),
        sessions: {
          none: {
            expires: { gt: new Date(now) },
          },
        },
      },
      select: { id: true },
      take: 100,
    });

    if (expiredUsers.length === 0) return;

    const expiredIds = expiredUsers.map((u) => u.id);

    await prisma.exam.deleteMany({
      where: { isCustom: true, createdById: { in: expiredIds } },
    });

    await prisma.user.deleteMany({
      where: { id: { in: expiredIds } },
    });
  } catch (err) {
    console.warn("Non-fatal error cleaning up expired demo sandboxes:", err);
  }
}
