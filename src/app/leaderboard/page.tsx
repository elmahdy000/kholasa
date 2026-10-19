import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";
import { LeaderboardService } from "@/services";

export default async function LeaderboardPage() {
  const currentUser = await getCurrentUser();
  const leaderboardUsers = await LeaderboardService.getLeaderboard(currentUser?.id);

  return (
    <StudentShell user={currentUser}>
      <div className="max-w-5xl mx-auto pb-28">
        <LeaderboardClient
          initialUsers={leaderboardUsers}
          currentUserId={currentUser?.id}
        />
      </div>
    </StudentShell>
  );
}
