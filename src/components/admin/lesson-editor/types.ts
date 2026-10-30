export interface LessonData {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  isPublished: boolean;
  unitId: string;
  unit?: {
    id: string;
    title: string;
    subject?: {
      id: string;
      name: string;
      color?: string | null;
    };
  };
  content?: {
    id?: string;
    body: string;
    videoUrl?: string | null;
    audioUrl?: string | null;
    pdfUrl?: string | null;
    objectives: string[];
  } | null;
  mindMap?: {
    id?: string;
    title: string;
    description?: string | null;
    images: string[];
    nodes?: unknown;
    edges?: unknown;
  } | null;
  summary?: {
    id?: string;
    pdfUrl?: string | null;
    images?: string[];
    keyConcepts?: unknown;
    definitions?: unknown;
    formulas?: unknown;
    comparisons?: unknown;
    examTips?: unknown;
    commonMistakes?: unknown;
    checklist?: unknown;
  } | null;
}

export type LessonEditorTabType =
  | "mindmap"
  | "definitions"
  | "questions"
  | "info"
  | "media"
  | "content"
  | "summary";

export interface UnitInfo {
  unitId?: string;
  unitTitle: string;
  subjectId?: string;
  subjectName: string;
  subjectColor?: string | null;
  schoolCategory?: "ARABIC" | "LANGUAGES";
  gradeId?: string;
  gradeName?: string;
  trackId?: string;
  trackName?: string;
}

export interface DefinitionItem {
  term: string;
  meaning: string;
}

export interface LessonQuestionOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  explanation?: string | null;
}

export interface LessonQuestionItem {
  id: string;
  statement: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  options?: LessonQuestionOption[];
  explanation?: {
    concept?: string;
    correctReason?: string;
  } | null;
  rubric?: {
    modelAnswer?: string;
  } | null;
}

export interface CommonMistakeItem {
  mistake: string;
  correction: string;
}
