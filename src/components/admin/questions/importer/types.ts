import { ParsedQuestion, QuestionType, QuestionDifficulty } from "@/lib/question-parser";

export interface TrackItem {
  id: string;
  name: string;
  code: string;
}

export interface GradeItem {
  id: string;
  name: string;
  code: string;
  tracks?: TrackItem[];
}

export interface LessonItem {
  id: string;
  title: string;
}

export interface UnitItem {
  id: string;
  title: string;
  lessons?: LessonItem[];
}

export interface SubjectItem {
  id: string;
  name: string;
  code?: string;
  gradeId?: string;
  schoolCategory?: "ARABIC" | "LANGUAGES";
  trackId?: string | null;
  grade?: GradeItem;
  track?: TrackItem;
  units: UnitItem[];
}

export interface QuestionWordImporterProps {
  subjects: SubjectItem[];
  grades?: GradeItem[];
  initialGradeId?: string;
  initialSchoolCategory?: "ARABIC" | "LANGUAGES";
  initialSubjectId?: string;
  initialUnitId?: string;
  initialLessonId?: string;
  onSuccess?: () => void;
  onImportSuccess?: () => void;
  isModal?: boolean;
}
