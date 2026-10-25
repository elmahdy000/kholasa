import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/date";
import { CurriculumScope } from "@/lib/curriculum";
import { Role } from "@prisma/client";

export interface LeaderboardEntry {
  id: string;
  name: string;
  systemName: string;
  gradeName: string;
  completedLessons: number;
  completedExams: number;
  xp: number;
  streak: number;
  isCurrentUser: boolean;
  role: string;
}

export class LeaderboardService {
  /**
   * Fetch leaderboard rankings with real student metrics
   */
  static async getLeaderboard(
    currentUserId?: string,
    limit = 20,
    scope: CurriculumScope | null = null
  ): Promise<LeaderboardEntry[]> {
    const scopeWhere =
      scope?.gradeId
        ? {
            gradeId: scope.gradeId,
            ...(scope.systemId ? { systemId: scope.systemId } : {}),
          }
        : {};

    // Fetch up to 100 students to properly compute and rank by XP
    const realUsers = await prisma.user.findMany({
      where: { role: Role.STUDENT, ...scopeWhere },
      take: Math.max(limit * 3, 100),
      include: {
        system: true,
        grade: true,
        progress: {
          where: { isCompleted: true },
          select: { id: true },
        },
        attempts: {
          where: { isCompleted: true },
          select: { id: true, score: true, percentage: true },
        },
      },
    });

    // Ensure current student is included in calculation even if outside the initial slice
    if (currentUserId && !realUsers.some((u) => u.id === currentUserId)) {
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: {
          system: true,
          grade: true,
          progress: {
            where: { isCompleted: true },
            select: { id: true },
          },
          attempts: {
            where: { isCompleted: true },
            select: { id: true, score: true, percentage: true },
          },
        },
      });
      if (currentUser) {
        realUsers.push(currentUser);
      }
    }

    const mappedReal: LeaderboardEntry[] = realUsers.map((u) => {
      const completedLessons = u.progress.length;
      const completedExams = u.attempts.length;
      const totalScore = u.attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const xp = completedLessons * 30 + completedExams * 50 + totalScore * 10;

      return {
        id: u.id,
        name: u.name || "طالب مجتهد",
        systemName: u.system?.name || "الثانوية العامة",
        gradeName: u.grade?.name || "الصف الثانوي",
        completedLessons,
        completedExams,
        xp,
        streak: 0,
        isCurrentUser: currentUserId === u.id,
        role: u.role,
      };
    });

    // Sort descending by XP
    mappedReal.sort((a, b) => b.xp - a.xp);

    const topSlice = mappedReal.slice(0, limit);
    if (currentUserId && !topSlice.some((u) => u.id === currentUserId)) {
      const currentUserEntry = mappedReal.find((u) => u.id === currentUserId);
      if (currentUserEntry) {
        topSlice.push(currentUserEntry);
      }
    }

    // Real streaks: consecutive completed daily check-ins (no fabricated values).
    const userIds = topSlice.map((u) => u.id);
    if (userIds.length > 0) {
      const challenges = await prisma.dailyChallenge.findMany({
        where: { userId: { in: userIds }, completedAt: { not: null } },
        select: { userId: true, day: true },
        orderBy: { day: "desc" },
      });

      const daysByUser = new Map<string, string[]>();
      for (const challenge of challenges) {
        const days = daysByUser.get(challenge.userId) ?? [];
        days.push(challenge.day);
        daysByUser.set(challenge.userId, days);
      }

      for (const entry of topSlice) {
        entry.streak = calculateStreak(daysByUser.get(entry.id) ?? []);
      }
    }

    return topSlice;
  }
}

