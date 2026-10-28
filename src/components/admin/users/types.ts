export interface EducationalSystem {
  id: string;
  name: string;
}

export interface Grade {
  id: string;
  name: string;
  systemId: string;
}

export interface UserItem {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: string;
  system?: { id: string; name: string } | null;
  grade?: { id: string; name: string } | null;
  attempts: { id: string; score: number; percentage?: number }[];
  progress: { id: string; isCompleted: boolean }[];
  createdAt: string | Date;
}

export interface UserManagerClientProps {
  initialUsers: UserItem[];
  systems: EducationalSystem[];
  grades: Grade[];
  currentUserId: string;
  currentUserRole: string;
}
