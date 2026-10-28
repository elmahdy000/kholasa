export interface Grade {
  id: string;
  name: string;
  code: string;
}

export interface EducationalSystem {
  id: string;
  name: string;
  code: string;
  grades: Grade[];
}

export interface BookmarkItem {
  id: string;
  lesson?: {
    id: string;
    title: string;
    unit: {
      title: string;
      subject: { name: string };
    };
  } | null;
}

export interface ProfileViewProps {
  user: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    system?: { id: string; name: string } | null;
    grade?: { id: string; name: string } | null;
  };
  stats: {
    completedLessonsCount: number;
    completedExamsCount: number;
    averageScore: number;
    resolvedMistakesCount: number;
  };
  bookmarks: BookmarkItem[];
  systems: EducationalSystem[];
}
