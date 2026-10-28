export interface Answer {
  id: string;
  selectedOptionId?: string | null;
  essayText?: string | null;
  isCorrect?: boolean | null;
  score?: number | null;
  timeSpentSeconds: number;
  question: {
    id: string;
    statement: string;
    type: "MCQ" | "TRUE_FALSE" | "ESSAY";
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
    }[];
    explanation?: {
      concept: string;
      correctReason: string;
    } | null;
    rubric?: {
      modelAnswer: string;
      maxScore: number;
    } | null;
  };
}

export interface Attempt {
  id: string;
  title: string;
  mode: "PRACTICE" | "EXAM";
  score: number;
  percentage: number;
  timeSpentSeconds: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string | null;
  user: {
    id: string;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  exam?: {
    id: string;
    title: string;
    durationMinutes: number;
    subject: {
      name: string;
      color?: string | null;
    };
  } | null;
  answers?: Answer[];
  _count?: {
    answers: number;
  };
}

export interface AttemptsManagerClientProps {
  initialAttempts: Attempt[];
  subjects: { id: string; name: string }[];
}
