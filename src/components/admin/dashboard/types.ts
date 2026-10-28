export interface AdminDashboardMetrics {
  studentsCount: number;
  subjectsCount: number;
  unitsCount: number;
  lessonsCount: number;
  questionsCount: number;
  examsCount: number;
  attemptsCount: number;
  avgScore: number;
}

export interface RecentAttemptItem {
  id: string;
  percentage: number;
  user?: {
    name?: string | null;
    phone?: string | null;
  } | null;
  exam?: {
    title: string;
    subject?: {
      name: string;
      color?: string | null;
    } | null;
  } | null;
}

export interface SubjectStatItem {
  id: string;
  name: string;
  color?: string | null;
  units: {
    lessons: { id: string }[];
  }[];
  questions: { id: string }[];
  exams: { id: string }[];
}
