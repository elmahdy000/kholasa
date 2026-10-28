export interface LessonCreateInput {
  unitId: string;
  title: string;
  durationMinutes?: number;
  order?: number;
  isPublished?: boolean;
  videoUrl?: string | null;
  audioUrl?: string | null;
  bodyText?: string;
  objectives?: string[];
  images?: string[];
}

export interface LessonUpdateInput {
  title?: string;
  durationMinutes?: number;
  order?: number;
  isPublished?: boolean;
  videoUrl?: string | null;
  audioUrl?: string | null;
  bodyText?: string;
  objectives?: string[];
  images?: string[];
  content?: {
    body?: string;
    videoUrl?: string | null;
    audioUrl?: string | null;
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
    keyConcepts?: string[];
    definitions?: string[];
    formulas?: string[];
    comparisons?: string[];
    examTips?: string[];
    commonMistakes?: string[];
    checklist?: string[];
  };
}
