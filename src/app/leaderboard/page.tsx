import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import {
  LeaderboardClient,
  LeaderboardUser,
} from "@/components/leaderboard/LeaderboardClient";

export default async function LeaderboardPage() {
  const currentUser = await getCurrentUser();

  // Fetch real users with their activity
  const users = await prisma.user.findMany({
    take: 20,
    include: {
      system: true,
      grade: true,
      progress: {
        where: { isCompleted: true },
        select: { id: true },
      },
      attempts: {
        where: { isCompleted: true },
        select: { id: true, score: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Demo top classmates to make competition feel lively
  const benchmarkPeers = [
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
      name: "يوسف مصطفى علام",
      systemName: "البكالوريا المصرية",
      gradeName: "الصف الثالث الثانوي",
      completedLessons: 8,
      completedExams: 5,
      xp: 590,
      streak: 4,
      isCurrentUser: false,
      role: "STUDENT",
    },
  ];

  // Map real users to LeaderboardUser
  const mappedUsers: LeaderboardUser[] = users.map((u) => {
    const isCurrent = u.id === currentUser?.id;
    const completedLessons = u.progress.length;
    const completedExams = u.attempts.length;
    // Calculate XP: 100 per exam + 50 per lesson + baseline
    const xp = completedExams * 100 + completedLessons * 50 + (isCurrent ? 450 : 200);

    return {
      id: u.id,
      name: u.name || "طالب مجتهد",
      avatar: u.avatar,
      role: u.role,
      systemName: u.system?.name || "الثانوية العامة",
      gradeName: u.grade?.name || "الصف الثالث الثانوي",
      completedLessons,
      completedExams,
      xp,
      streak: isCurrent ? 5 : 3,
      isCurrentUser: isCurrent,
    };
  });

  // Combine and deduplicate
  const allUsersMap = new Map<string, LeaderboardUser>();
  for (const peer of benchmarkPeers) {
    allUsersMap.set(peer.id, peer);
  }
  for (const u of mappedUsers) {
    allUsersMap.set(u.id, u);
  }

  const combinedUsers = Array.from(allUsersMap.values());

  return (
    <StudentShell user={currentUser}>
      <div className="max-w-5xl mx-auto pb-28">
        <LeaderboardClient
          initialUsers={combinedUsers}
          currentUserId={currentUser?.id}
        />
      </div>
    </StudentShell>
  );
}
