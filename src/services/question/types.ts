import { QuestionType, Difficulty, PublishStatus, SchoolCategory, Prisma } from "@prisma/client";

export interface ParsedQuestionImportItem {
  statement: string;
  translation?: string | null;
  subjectId?: string;
  unitId?: string | null;
  lessonId?: string | null;
  questionLesson?: string | null;
  type?: QuestionType;
  difficulty?: Difficulty;
  schoolCategory?: SchoolCategory;
  imageUrl?: string | null;
  options?: {
    text: string;
    translation?: string | null;
    isCorrect: boolean;
    explanation?: string | null;
    order?: number;
  }[];
  concept?: string | null;
  correctReason?: string | null;
  modelAnswer?: string | null;
  modelAnswerTranslation?: string | null;
  points?: number;
}

export interface BulkImportMeta {
  fileName?: string;
  fileType?: string; // "DOCX" | "PDF" | "MANUAL"
  questionType?: QuestionType;
  difficulty?: Difficulty;
  schoolCategory?: SchoolCategory;
  gradeId?: string;
  subjectId: string;
  unitId?: string | null;
  lessonId?: string | null;
  lessonScope?: "UNIT" | "LESSON";
  trackId?: string | null;
}

export interface QuestionFilterParams {
  subjectId?: string;
  gradeId?: string;
  schoolCategory?: SchoolCategory | "ALL";
  unitId?: string;
  lessonId?: string;
  type?: QuestionType | "ALL";
  difficulty?: Difficulty | "ALL";
  status?: PublishStatus | "ALL";
  search?: string;
  page?: number;
  limit?: number;
}

export interface QuestionCreateInput {
  statement: string;
  translation?: string | null;
  subjectId: string;
  unitId?: string | null;
  lessonIds?: string[];
  type?: QuestionType;
  difficulty?: Difficulty;
  status?: PublishStatus;
  schoolCategory?: SchoolCategory;
  imageUrl?: string | null;
  options?: {
    text: string;
    translation?: string | null;
    isCorrect: boolean;
    order?: number;
    explanation?: string | null;
  }[];
  explanation?: {
    concept: string;
    correctReason: string;
    sectionId?: string | null;
  };
  rubric?: {
    modelAnswer: string;
    modelAnswerTranslation?: string | null;
    criteria?: Prisma.InputJsonValue;
    maxScore?: number;
  };
}

export interface QuestionUpdateInput {
  statement?: string;
  translation?: string | null;
  subjectId?: string;
  unitId?: string | null;
  lessonIds?: string[];
  type?: QuestionType;
  difficulty?: Difficulty;
  status?: PublishStatus;
  schoolCategory?: SchoolCategory;
  imageUrl?: string | null;
  options?: {
    id?: string;
    text: string;
    translation?: string | null;
    isCorrect: boolean;
    order?: number;
    explanation?: string | null;
  }[];
  explanation?: {
    concept: string;
    correctReason: string;
    sectionId?: string | null;
  } | null;
  rubric?: {
    modelAnswer: string;
    modelAnswerTranslation?: string | null;
    criteria?: Prisma.InputJsonValue;
    maxScore?: number;
  } | null;
}
