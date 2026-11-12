import type { SchoolCategory } from "@prisma/client";

export type LandingTabType = "zatona" | "questions" | "mistakes" | "mindmap";

export interface FaqItem {
  q: string;
  a: string;
}

export interface DemoMcqOption {
  id: number;
  text: string;
  isCorrect: boolean;
  reason: string;
}

export interface LandingDefinitionItem {
  term: string;
  meaning: string;
  translation?: string;
}

export interface LandingMindMapData {
  title: string;
  description?: string | null;
  images: string[];
  nodes: Array<{ id: string; label: string; level: number; description?: string }>;
  edges: Array<{ id: string; source: string; target: string }>;
}

export interface LandingPreviewQuestionPublic {
  id: string;
  lessonId: string;
  statement: string;
  translation: string | null;
  difficulty: string;
  options: Array<{
    id: string;
    text: string;
    translation: string | null;
    order: number;
  }>;
}

export interface LandingLessonItem {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  publishedQuestionsCount: number;
  definitions: LandingDefinitionItem[];
  mindMap: LandingMindMapData | null;
  previewMcq: LandingPreviewQuestionPublic | null;
}

export interface LandingUnitItem {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessonsCount?: number;
  lessons: LandingLessonItem[];
}

export interface LandingSubjectItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  schoolCategory: SchoolCategory;
  isCommonCategory?: boolean;
  gradeId: string;
  gradeName: string;
  gradeCode: string;
  trackName: string | null;
  publishedUnitsCount: number;
  publishedLessonsCount: number;
  publishedQuestionsCount: number;
  units: LandingUnitItem[];
}

export interface LandingContinueItem {
  lessonId: string;
  lessonTitle: string;
  unitTitle: string;
  subjectId: string;
  subjectName: string;
  progressPercent: number;
  isCompleted: boolean;
  lastAccessedAt: string;
}

export interface LandingSampleQuestionBucket {
  gradeId: string;
  schoolCategory: SchoolCategory;
  highlight: LandingHeroHighlight;
}

export interface LandingGradeItem {
  id: string;
  name: string;
  code: string;
  order: number;
}

export interface LandingHeroHighlight {
  schoolCategory: SchoolCategory;
  subjectName: string;
  unitTitle: string;
  lessonId: string;
  lessonTitle: string;
  question: LandingPreviewQuestionPublic;
}

export interface LandingAnswerCheckResult {
  ok: boolean;
  error?: string;
  isCorrect?: boolean;
  selectedOptionId?: string;
  correctOptionId?: string;
  correctOptionText?: string;
  explanation?: {
    concept: string | null;
    correctReason: string;
  } | null;
}

export interface LandingCurriculumPayload {
  grades: LandingGradeItem[];
  subjects: LandingSubjectItem[];
  sampleQuestionsByBucket: LandingSampleQuestionBucket[];
  heroQuestions: {
    arabic: LandingHeroHighlight | null;
    languages: LandingHeroHighlight | null;
  };
  sampleProofs: {
    questionExample: {
      subjectName: string;
      lessonTitle: string;
      statement: string;
      correctAnswerText: string;
      concept: string | null;
      correctReason: string;
    } | null;
    definitionExample: {
      subjectName: string;
      lessonTitle: string;
      term: string;
      meaning: string;
      translation: string | null;
      isLanguages: boolean;
    } | null;
    mindMapExample: {
      subjectName: string;
      lessonTitle: string;
      title: string;
      imageUrl: string;
      boardsCount: number;
    } | null;
  };
}
