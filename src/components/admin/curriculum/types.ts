export interface Lesson {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  isPublished: boolean;
  viewsCount: number;
}

export interface Unit {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  isPublished: boolean;
  lessons: Lesson[];
}

export interface AcademicTrack {
  id: string;
  name: string;
  nameEn?: string | null;
  code: string;
  gradeId: string;
  categoryScope?: string | null;
  isActive: boolean;
  order: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color?: string | null;
  icon?: string | null;
  description?: string | null;
  systemId: string;
  gradeId: string;
  trackId?: string | null;
  schoolCategory: "ARABIC" | "LANGUAGES";
  isElective?: boolean;
  electiveGroup?: string | null;
  order: number;
  isPublished: boolean;
  units: Unit[];
  _count?: {
    units?: number;
    questions?: number;
    exams?: number;
  };
}

export interface Grade {
  id: string;
  name: string;
  code: string;
  systemId: string;
  order: number;
  tracks: AcademicTrack[];
  subjects: Subject[];
}

export interface System {
  id: string;
  name: string;
  code: string;
  grades: Grade[];
  subjects?: Subject[];
}

export interface CurriculumManagerClientProps {
  initialSystems: System[];
}
