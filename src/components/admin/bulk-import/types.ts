export interface Subject {
  id: string;
  name: string;
  units: { id: string; title: string }[];
}

export interface ParsedQuestion {
  statement: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  subjectId: string;
  unitId?: string;
  concept?: string;
  correctReason?: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  isValid: boolean;
  error?: string;
}

export interface BulkImportClientProps {
  subjects: Subject[];
}
