import { QuestionType, Difficulty } from "@prisma/client";

export interface CustomExamCreateInput {
  subjectId?: string;
  unitId?: string | null;
  lessonIds?: string[];
  type?: QuestionType | "ALL";
  difficulty?: Difficulty | "ALL";
  questionCount?: number;
  durationMinutes?: number;
  mode?: "PRACTICE" | "EXAM";
  title?: string;
  questionIds?: string[];
}

export interface RecordAnswerInput {
  attemptId: string;
  questionId: string;
  selectedOptionId?: string | null;
  essayText?: string | null;
  timeSpentSeconds?: number;
}
