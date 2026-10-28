"use client";

import { useState, useEffect } from "react";
import { DailyChallengeCard } from "./DailyChallengeCard";
import { StreakWidget } from "./StreakWidget";
import { DashboardHero } from "./DashboardHero";
import { ContinueLearningCard } from "./ContinueLearningCard";
import { DashboardStatsGrid } from "./DashboardStatsGrid";
import { QuickActionsGrid } from "./QuickActionsGrid";
import { SubjectsGrid } from "./SubjectsGrid";
import { RecentExamsList } from "./RecentExamsList";
import type { DashboardClientProps } from "./types";

export type { DashboardClientProps, ContinueLessonItem, SubjectItem, RecentExamItem, StudentMeta } from "./types";

export function DashboardClient({
  userName,
  studentMeta,
  completedLessonsCount,
  recentAttemptsCount,
  averageScore = null,
  streakDays = 0,
  isTodayCompleted = false,
  weekDays = [],
  unresolvedMistakesCount,
  subjects,
  continueLesson,
  dailyQuestion,
  recentExams = [],
}: DashboardClientProps) {
  const [currentStreakDays, setCurrentStreakDays] = useState(streakDays);
  const [isTodayCompletedState, setIsTodayCompletedState] = useState(isTodayCompleted);

  useEffect(() => {
    const handleStreakUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ streakDays: number; isTodayCompleted: boolean }>;
      if (customEvent.detail) {
        if (typeof customEvent.detail.streakDays === "number") {
          setCurrentStreakDays(customEvent.detail.streakDays);
        }
        if (customEvent.detail.isTodayCompleted) {
          setIsTodayCompletedState(true);
        }
      }
    };
    window.addEventListener("kholasa_streak_updated", handleStreakUpdate);
    return () => window.removeEventListener("kholasa_streak_updated", handleStreakUpdate);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-7 text-right">
      {/* 1. Hero */}
      <DashboardHero
        userName={userName}
        studentMeta={studentMeta}
        continueLesson={continueLesson}
      />

      {/* 2. Streak Timeline */}
      <StreakWidget
        initialStreakDays={currentStreakDays}
        initialIsTodayCompleted={isTodayCompletedState}
        initialWeekDays={weekDays}
        onOpenDailyChallenge={() => {
          const el = document.getElementById("daily-challenge-card");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            window.dispatchEvent(new CustomEvent("kholasa_open_entrance_exam"));
          }
        }}
      />

      {/* 3. Continue Learning */}
      <ContinueLearningCard continueLesson={continueLesson} />

      {/* 4. Stats Grid */}
      <DashboardStatsGrid
        completedLessonsCount={completedLessonsCount}
        recentAttemptsCount={recentAttemptsCount}
        unresolvedMistakesCount={unresolvedMistakesCount}
        averageScore={averageScore}
      />

      {/* 5. Quick Actions Bento Grid */}
      <QuickActionsGrid
        subjectsCount={subjects.length}
        unresolvedMistakesCount={unresolvedMistakesCount}
      />

      {/* 6. Daily Challenge */}
      {dailyQuestion && (
        <section>
          <DailyChallengeCard
            question={dailyQuestion}
            isTodayAlreadyCompleted={isTodayCompletedState}
          />
        </section>
      )}

      {/* 7. Curriculum Subjects */}
      <SubjectsGrid subjects={subjects} />

      {/* 8. Recent Exam Results */}
      <RecentExamsList recentExams={recentExams} />
    </div>
  );
}