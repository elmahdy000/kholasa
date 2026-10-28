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

export interface Subject {
  id: string;
  name: string;
  color?: string | null;
  isPublished: boolean;
  units: Unit[];
}

export interface System {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface CurriculumManagerClientProps {
  initialSystems: System[];
}
