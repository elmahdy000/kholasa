import type {
  ArabicLessonPayloadV1,
  ArabicNormalizedSection,
  ArabicVisualAsset,
  ArabicVocabularyItem,
} from "@/lib/arabic-curriculum";

export interface ArabicEditorQuestionRecord {
  id: string;
  externalKey: string | null;
  statement: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  origin: string | null;
  skillCategory: string | null;
  sourceReferences: Array<{ sourceId: string; pages: number[] }> | null;
  options: Array<{ id: string; text: string; isCorrect: boolean; order: number }>;
  explanation: {
    id: string;
    concept: string;
    correctReason: string;
    examTrick: string | null;
    origin: string | null;
    sectionId: string | null;
    section?: { id: string; anchorId: string; title: string } | null;
  } | null;
  rubric: {
    id: string;
    modelAnswer: string;
    maxScore: number;
  } | null;
}

export interface ArabicLessonVersionSummary {
  id: string;
  versionNumber: number;
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
  notes: string | null;
  createdAt: string;
  publishedAt: string | null;
  createdBy: { id: string; name: string | null } | null;
}

export interface ArabicEditorLessonMeta {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  isPublished: boolean;
  isTrial: boolean;
  videoUrl: string | null;
  audioUrl: string | null;
  pdfUrl: string | null;
  unit: {
    id: string;
    title: string;
    order: number;
    subject: {
      id: string;
      name: string;
      code: string;
      learningEngine: string;
      isCommonCategory: boolean;
      isUnderConstruction: boolean;
      grade?: { id: string; name: string; code: string } | null;
    };
  };
  mindMapImages: string[];
  versions: ArabicLessonVersionSummary[];
  latestDraftVersionId: string | null;
}

export interface ArabicLessonEditorPayload {
  lesson: ArabicEditorLessonMeta;
  structured: ArabicLessonPayloadV1 | null;
  questions: ArabicEditorQuestionRecord[];
}

export type ArabicEditorTabId =
  | "content"
  | "assets"
  | "vocabulary"
  | "questions"
  | "publish";

export type { ArabicNormalizedSection, ArabicVisualAsset, ArabicVocabularyItem };

