export interface Option {
  id: string;
  text: string;
  order: number;
}

export interface QuestionItem {
  id: string;
  statement: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: string;
  subjectName: string;
  unitTitle?: string | null;
  options: Option[];
}

export interface ReviewedQuestion {
  id: string;
  statement: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: string;
  subjectName: string;
  unitTitle?: string | null;
  isCorrect: boolean | null;
  selectedAnswer: string;
  correctAnswer: string;
  concept?: string | null;
  correctReason?: string | null;
  modelAnswer?: string | null;
}

export interface ExamResult {
  score: number;
  totalQuestions: number;
  totalObjective?: number;
  percentage: number;
  wrongCount: number;
  reviewedQuestions: ReviewedQuestion[];
}

export interface EntranceGatekeeperModalProps {
  userRole?: string;
  userId?: string;
}
