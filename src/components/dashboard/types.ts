import type { WeekDayProgress } from "./StreakWidget";

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

export interface DashboardClientProps {
  userName?: string | null;
  studentMeta?: StudentMeta;
  completedLessonsCount: number;
  recentAttemptsCount: number;
  averageScore?: number | null;
  streakDays?: number;
  isTodayCompleted?: boolean;
  weekDays?: WeekDayProgress[];
  unresolvedMistakesCount: number;
  subjects: SubjectItem[];
  continueLesson?: ContinueLessonItem | null;
  dailyQuestion?: any;
  recentExams?: RecentExamItem[];
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
