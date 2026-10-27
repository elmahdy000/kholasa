import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getCairoDayKey, calculateStreak } from "@/lib/date";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const todayKey = getCairoDayKey();

    await prisma.dailyChallenge.upsert({
      where: { userId_day: { userId: user.id, day: todayKey } },
      update: { completedAt: new Date() },
      create: {
        userId: user.id,
        day: todayKey,
        completedAt: new Date(),
        questionIds: [],
      },
    });

    const userChallenges = await prisma.dailyChallenge.findMany({
      where: { userId: user.id, completedAt: { not: null } },
      select: { day: true },
    });
    const streakDays = calculateStreak(userChallenges.map((c) => c.day));

    return NextResponse.json({
      success: true,
      streakDays,
      isTodayCompleted: true,
      todayKey,
    });
  } catch (error) {
    return jsonError(error);
  }
}
