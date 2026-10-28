export interface Subject {
  id: string;
  name: string;
  code: string;
  color?: string | null;
  isPublished: boolean;
  order: number;
  _count?: {
    units: number;
    questions: number;
    exams: number;
  };
}

export interface Grade {
  id: string;
  name: string;
  code: string;
  order: number;
  systemId: string;
  subjects: Subject[];
}

export interface System {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  order: number;
  grades: Grade[];
}

export interface StructureManagerClientProps {
  initialSystems: System[];
}
