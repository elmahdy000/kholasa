"use client";

import { useState, useEffect } from "react";
import { DailyChallengeCard } from "./DailyChallengeCard";
import { StreakWidget } from "./StreakWidget";
import { DashboardHero } from "./DashboardHero";
import { ContinueLearningCard } from "./ContinueLearningCard";
import { DashboardStatsGrid } from "./DashboardStatsGrid";
import { DashboardMistakesSpotlight } from "./DashboardMistakesSpotlight";
import { QuickActionsGrid } from "./QuickActionsGrid";
import { SubjectsGrid } from "./SubjectsGrid";
import { RecentExamsList } from "./RecentExamsList";
import { ProductTourModal } from "./ProductTourModal";
import { StudentMasteryMapCard } from "./StudentMasteryMapCard";
import { DailyGuidedStudyPlanCard } from "./DailyGuidedStudyPlanCard";
import { useStudentMistakesSummary } from "@/hooks/useStudentMistakesSummary";
import type { StudentMistakeDiagnosisSummary } from "@/lib/mistake-diagnosis";
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
  mistakesSummary,
  subjects,
  continueLesson,
  dailyQuestion,
  recentExams = [],
  masteryData,
  dailyStudyPlan,
  isSubscribed = true,
}: DashboardClientProps) {
  const [currentStreakDays, setCurrentStreakDays] = useState(streakDays);
  const [isTodayCompletedState, setIsTodayCompletedState] = useState(isTodayCompleted);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const { summary: liveSummary, hasLoaded } = useStudentMistakesSummary(true);

  const effectiveMistakesSummary: StudentMistakeDiagnosisSummary = hasLoaded
    ? liveSummary
    : mistakesSummary ?? {
        unresolvedCount: unresolvedMistakesCount,
        resolvedCount: 0,
        topWeakness: null,
        breakdown: [],
      };
  const liveUnresolvedMistakesCount = effectiveMistakesSummary.unresolvedCount;

  // Launch guided tour ONLY when explicitly requested via ?tour=true or "جولة المنصة" CTA
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") === "true") {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

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

  const handleOpenDailyChallenge = () => {
    const el = document.getElementById("daily-challenge-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.dispatchEvent(new CustomEvent("kholasa_open_entrance_exam"));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 text-right">
      {/* 1. Welcome Hero */}
      <DashboardHero
        userName={userName}
        studentMeta={studentMeta}
        continueLesson={continueLesson}
        onStartTour={() => setIsTourOpen(true)}
      />

      {/* Product Tour Modal (On Demand) */}
      <ProductTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        userName={userName}
      />

      {/* 2. Immediate Resume Anchor */}
      <ContinueLearningCard continueLesson={continueLesson} />

      {/* 3. Live Animated Mistakes Counter & Weakness Diagnosis Spotlight */}
      <DashboardMistakesSpotlight summary={effectiveMistakesSummary} />

      {/* 4. Curriculum Subjects (Directly Reachable) */}
      <SubjectsGrid subjects={subjects} />

      {/* 5. Daily Streak & Quick Guided Study Plan */}
      <StreakWidget
        initialStreakDays={currentStreakDays}
        initialIsTodayCompleted={isTodayCompletedState}
        initialWeekDays={weekDays}
        onOpenDailyChallenge={handleOpenDailyChallenge}
      />

      {dailyStudyPlan && (
        <DailyGuidedStudyPlanCard
          plan={dailyStudyPlan}
          isSubscribed={isSubscribed}
          onOpenDailyChallenge={handleOpenDailyChallenge}
        />
      )}

      {/* 6. Stats Grid & Quick Shortcuts */}
      <DashboardStatsGrid
        completedLessonsCount={completedLessonsCount}
        recentAttemptsCount={recentAttemptsCount}
        unresolvedMistakesCount={liveUnresolvedMistakesCount}
        averageScore={averageScore}
      />

      <QuickActionsGrid
        subjectsCount={subjects.length}
        unresolvedMistakesCount={liveUnresolvedMistakesCount}
      />

      {/* 7. Daily Challenge & Mastery Map & Recent Activity */}
      {dailyQuestion && (
        <section>
          <DailyChallengeCard
            question={dailyQuestion}
            isTodayAlreadyCompleted={isTodayCompletedState}
            isSubscribed={isSubscribed}
          />
        </section>
      )}

      {masteryData && <StudentMasteryMapCard data={masteryData} />}

      <RecentExamsList recentExams={recentExams} />
    </div>
  );
}
