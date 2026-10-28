export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
  explanation?: string | null;
}

export interface QuestionExplanation {
  concept: string;
  correctReason: string;
}

export interface Question {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  subject: { id: string; name: string };
  unit?: { id: string; title: string } | null;
  options: QuestionOption[];
  explanation?: QuestionExplanation | null;
  lessons: { lesson: { id: string; title: string } }[];
}

export interface MistakeItem {
  id: string;
  questionId: string;
  wrongCount: number;
  isResolved: boolean;
  lastAttemptAt: Date | string;
  question: Question;
}

export interface MistakeHubClientProps {
  initialMistakes: MistakeItem[];
  subjects: { id: string; name: string }[];
}

export interface ActiveAnswerState {
  selectedOptionId: string;
  isChecking: boolean;
  result?: { isCorrect: boolean };
}
