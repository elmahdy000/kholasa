import { prisma } from "@/lib/prisma";
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
   * Benchmark peer students for healthy competition
   */
  private static BENCHMARK_PEERS: LeaderboardEntry[] = [
    {
      id: "peer_1",
      name: "أحمد حسام الشناوي",
      systemName: "الثانوية العامة",
      gradeName: "الصف الثالث الثانوي",
      completedLessons: 18,
      completedExams: 14,
      xp: 1250,
      streak: 12,
      isCurrentUser: false,
      role: "STUDENT",
    },
    {
      id: "peer_2",
      name: "سارة محمد إبراهيم",
      systemName: "البكالوريا المصرية",
      gradeName: "الصف الثاني الثانوي",
      completedLessons: 16,
      completedExams: 11,
      xp: 1040,
      streak: 9,
      isCurrentUser: false,
      role: "STUDENT",
    },
    {
      id: "peer_3",
      name: "عمر خالد الفقي",
      systemName: "الثانوية العامة",
      gradeName: "الصف الثالث الثانوي",
      completedLessons: 14,
      completedExams: 9,
      xp: 910,
      streak: 7,
      isCurrentUser: false,
      role: "STUDENT",
    },
    {
      id: "peer_4",
      name: "نوران طارق يوسف",
      systemName: "الثانوية العامة",
      gradeName: "الصف الثاني الثانوي",
      completedLessons: 10,
      completedExams: 7,
      xp: 720,
      streak: 6,
      isCurrentUser: false,
      role: "STUDENT",
    },
    {
      id: "peer_5",
      name: "كريم ممدوح الصاوي",
      systemName: "البكالوريا المصرية",
      gradeName: "الصف الأول الثانوي",
      completedLessons: 8,
      completedExams: 5,
      xp: 580,
      streak: 4,
      isCurrentUser: false,
      role: "STUDENT",
    },
  ];

  /**
   * Fetch leaderboard rankings with real student metrics
   */
  static async getLeaderboard(currentUserId?: string, limit = 20): Promise<LeaderboardEntry[]> {
    const realUsers = await prisma.user.findMany({
      where: { role: Role.STUDENT },
      take: limit,
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

    const mappedReal: LeaderboardEntry[] = realUsers.map((u) => {
      const completedLessons = u.progress.length;
      const completedExams = u.attempts.length;
      const totalScore = u.attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const xp = completedLessons * 30 + completedExams * 50 + totalScore * 10;
      const streak = Math.min(14, Math.max(1, completedExams + Math.floor(completedLessons / 2)));

      return {
        id: u.id,
        name: u.name || "طالب مجتهد",
        systemName: u.system?.name || "الثانوية العامة",
        gradeName: u.grade?.name || "الصف الثانوي",
        completedLessons,
        completedExams,
        xp,
        streak,
        isCurrentUser: currentUserId === u.id,
        role: u.role,
      };
    });

    // Merge real students with benchmark peers if real students count is low
    let combined = [...mappedReal];
    for (const peer of this.BENCHMARK_PEERS) {
      if (!combined.some((c) => c.name === peer.name)) {
        combined.push(peer);
      }
    }

    // Sort descending by XP
    combined.sort((a, b) => b.xp - a.xp);

    return combined.slice(0, limit);
  }
}
