export interface LessonCreateInput {
  unitId: string;
  title: string;
  durationMinutes?: number;
  order?: number;
  isPublished?: boolean;
  videoUrl?: string | null;
  audioUrl?: string | null;
  pdfUrl?: string | null;
  bodyText?: string;
  objectives?: string[];
  images?: string[];
  summaryPdfUrl?: string | null;
  summaryImages?: string[];
  keyConcepts?: string[];
  definitions?: unknown[];
  formulas?: unknown[];
  comparisons?: unknown[];
  examTips?: string[];
  commonMistakes?: unknown[];
  checklist?: unknown[];
}

export interface LessonUpdateInput {
  title?: string;
  durationMinutes?: number;
  order?: number;
  isPublished?: boolean;
  videoUrl?: string | null;
  audioUrl?: string | null;
  pdfUrl?: string | null;
  bodyText?: string;
  objectives?: string[];
  images?: string[];
  content?: {
    body?: string;
    videoUrl?: string | null;
    audioUrl?: string | null;
    pdfUrl?: string | null;
    objectives?: string[];
  };
  mindMap?: {
    title?: string;
    description?: string | null;
    images?: string[];
    nodes?: unknown;
    edges?: unknown;
  };
  summary?: {
    pdfUrl?: string | null;
    images?: string[];
    keyConcepts?: string[];
    definitions?: unknown;
    formulas?: unknown;
    comparisons?: unknown;
    examTips?: string[];
    commonMistakes?: unknown;
    checklist?: unknown;
  };
}
