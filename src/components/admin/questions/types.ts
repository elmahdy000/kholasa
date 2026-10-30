export interface QuestionOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
  explanation?: string | null;
}

export interface QuestionExplanation {
  concept: string;
  correctReason: string;
}

export interface EssayRubric {
  modelAnswer: string;
  maxScore: number;
}

export interface TrackItem {
  id: string;
  name: string;
  code: string;
}

export interface Grade {
  id: string;
  name: string;
  code: string;
  tracks?: TrackItem[];
}

export interface Question {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  schoolCategory?: "ARABIC" | "LANGUAGES";
  imageUrl?: string | null;
  subject: {
    id: string;
    name: string;
    gradeId?: string;
    schoolCategory?: "ARABIC" | "LANGUAGES";
  };
  unit?: { id: string; title: string } | null;
  lessons?: { lesson: { id: string; title: string } }[] | null;
  options: QuestionOption[];
  explanation?: QuestionExplanation | null;
  rubric?: EssayRubric | null;
  batch?: { id: string; fileName: string; fileType: string } | null;
}

export interface Subject {
  id: string;
  name: string;
  gradeId?: string;
  schoolCategory?: "ARABIC" | "LANGUAGES";
  grade?: { id: string; name: string; code: string };
  track?: { id: string; name: string; code: string } | null;
  units: {
    id: string;
    title: string;
    lessons?: { id: string; title: string }[];
  }[];
}

export interface QuestionBankManagerClientProps {
  openCreate?: boolean;
  initialSubjectId?: string;
  initialQuestions: Question[];
  subjects: Subject[];
  grades?: Grade[];
}
