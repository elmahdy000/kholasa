import type { WeekDayProgress } from "./StreakWidget";
import type { DailyStudyPlanData } from "./DailyGuidedStudyPlanCard";

export type { DailyStudyPlanData } from "./DailyGuidedStudyPlanCard";

export interface ContinueLessonItem {
  id: string;
  title: string;
  durationMinutes: number;
  unit: {
    id: string;
    title: string;
    subject: {
      id: string;
      name: string;
      color?: string | null;
    };
  };
  progressPercent?: number;
}

export interface SubjectItem {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isCommonCategory?: boolean;
  isUnderConstruction?: boolean;
  unitsCount: number;
  totalLessons: number;
  completedLessons?: number;
  progressPercent?: number;
}

export interface RecentExamItem {
  id: string;
  title: string;
  percentage: number;
  totalQuestions: number;
  completedAt: string | null;
}

export interface StudentMeta {
  systemName?: string | null;
  gradeName?: string | null;
  trackName?: string | null;
}

import type { StudentMistakeDiagnosisSummary } from "@/lib/mistake-diagnosis";

export interface StarterLessonRef {
  id: string;
  title: string;
}

export interface DashboardClientProps {
  userId?: string | null;
  userName?: string | null;
  studentMeta?: StudentMeta;
  completedLessonsCount: number;
  recentAttemptsCount: number;
  averageScore?: number | null;
  streakDays?: number;
  isTodayCompleted?: boolean;
  weekDays?: WeekDayProgress[];
  unresolvedMistakesCount: number;
  mistakesSummary?: StudentMistakeDiagnosisSummary;
  subjects: SubjectItem[];
  continueLesson?: ContinueLessonItem | null;
  starterLesson?: StarterLessonRef | null;
  dailyQuestion?: any;
  recentExams?: RecentExamItem[];
  masteryData?: any;
  dailyStudyPlan?: DailyStudyPlanData | null;
  isSubscribed?: boolean;
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};
