export interface Subject {
  id: string;
  name: string;
  color?: string | null;
  questionsCount?: number;
  units?: {
    id: string;
    title: string;
    order?: number;
    lessons?: {
      id: string;
      title: string;
      order?: number;
    }[];
  }[];
}

export interface ExamItem {
  id: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  isPractice: boolean;
  subject: {
    id: string;
    name: string;
    color?: string | null;
  };
  questionsCount: number;
  attemptsCount: number;
  avgPercentage: number;
  createdAt: string | Date;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  isPublished?: boolean;
  scopeDetails?: { unitIds?: string[]; lessonIds?: string[] } | null;
}
