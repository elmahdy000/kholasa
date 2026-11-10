import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";
import { LeaderboardService } from "@/services/leaderboard.service";

export const metadata: Metadata = {
  title: "لوحة الشرف والأوائل | الخلاصة للبكالوريا",
  description:
    "لوحة المتفوقين والأوائل لطلاب البكالوريا المصرية (بكالوريا عربي وبكالوريا لغات) على منصة الخلاصة للبكالوريا بإشراف Dr/Elmahdy.",
  alternates: {
    canonical: "/leaderboard",
  },
};

export default async function LeaderboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?callbackUrl=/leaderboard");
  }

  const leaderboardUsers = await LeaderboardService.getLeaderboard(
    currentUser.id,
    20,
    getCurriculumScope(currentUser)
  );

  return (
    <StudentShell user={currentUser}>
      <div className="max-w-5xl mx-auto pb-28">
        <LeaderboardClient
          initialUsers={leaderboardUsers}
          currentUserId={currentUser.id}
        />
      </div>
    </StudentShell>
  );
}
