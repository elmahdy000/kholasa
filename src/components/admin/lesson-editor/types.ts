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

export type LessonEditorTabType = "media" | "mindmap" | "content" | "summary";

export interface UnitInfo {
  unitTitle: string;
  subjectName: string;
  subjectColor?: string | null;
}

export interface CommonMistakeItem {
  mistake: string;
  correction: string;
}
