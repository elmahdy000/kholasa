export interface Lesson {
  id: string;
  title: string;
  order: number;
}

export interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Subject {
  id: string;
  name: string;
  color?: string | null;
  units: Unit[];
}

export interface ExamBuilderFormProps {
  subjects: Subject[];
  initialSubjectId?: string;
  initialUnitId?: string;
  initialLessonId?: string;
}

export type ScopeType = "subject" | "unit" | "lessons";
export type QuestionTypeOption = "ALL" | "MCQ" | "TRUE_FALSE" | "ESSAY";
export type DifficultyOption = "ALL" | "EASY" | "MEDIUM" | "HARD";
export type ExamMode = "PRACTICE" | "EXAM";
