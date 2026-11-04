export interface QuestionOption {
  id: string;
  text: string;
  translation?: string | null;
  order: number;
  explanation?: string | null;
}

export interface QuestionExplanation {
  id: string;
  concept: string;
  correctReason: string;
  sectionId?: string | null;
}

export interface RevealedOption {
  id: string;
  text?: string;
  translation?: string | null;
  isCorrect?: boolean;
  explanation?: string | null;
}

export interface RevealedAnswer {
  isCorrect?: boolean;
  correctOptionId?: string;
  isEssay?: boolean;
  explanation?: QuestionExplanation | null;
  options?: RevealedOption[];
  modelAnswer?: string | null;
  modelAnswerTranslation?: string | null;
  criteria?: unknown;
  maxScore?: number;
}

export interface Question {
  id: string;
  statement: string;
  translation?: string | null;
  type: string;
  difficulty: string;
  imageUrl?: string | null;
  options: QuestionOption[];
  schoolCategory?: string;
}

export interface UserAnswerState {
  selectedOptionId?: string;
  essayText?: string;
  timeSpentSeconds?: number;
  practiceRevealed?: boolean;
}

export interface ExamSolverExam {
  id: string;
  title: string;
  durationMinutes: number;
  isPractice: boolean;
  schoolCategory?: string;
  subject: {
    id: string;
    name: string;
    schoolCategory?: string;
  };
  questions: {
    order: number;
    question: Question;
  }[];
}

export interface ExamSolverProps {
  exam: ExamSolverExam;
  attemptId: string;
  initialMode: "PRACTICE" | "EXAM";
}
