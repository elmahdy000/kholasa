export interface EducationalSystem {
  id: string;
  name: string;
}

export interface Grade {
  id: string;
  name: string;
  systemId: string;
}

export type UserSubscriptionStatus = "TRIAL" | "ACTIVE" | "PENDING_VERIFICATION" | "EXPIRED";

export type UserActivationFilter =
  | "all"
  | "subscribed"
  | "trial_active"
  | "pending_verification"
  | "inactive";

export interface UserItem {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  loginCode?: string | null;
  role: string;
  schoolCategory?: "ARABIC" | "LANGUAGES";
  system?: { id: string; name: string } | null;
  grade?: { id: string; name: string } | null;
  attempts: { id: string; score: number; percentage?: number }[];
  progress: { id: string; isCompleted: boolean }[];
  maxDevices?: number;
  boundDevices?: string[];
  createdAt: string | Date;
  lastActiveAt?: string | Date | null;
  totalLessons?: number;
  progressPercent?: number;
  isActive?: boolean;
  studyMode?: "ONLINE" | "OFFLINE";
  centerName?: string | null;
  subscriptionStatus?: UserSubscriptionStatus;
  paymentReceiptUrl?: string | null;
  paymentUploadedAt?: string | Date | null;
  subscriptionExpiresAt?: string | Date | null;
}

export interface UserManagerClientProps {
  initialUsers: UserItem[];
  systems: EducationalSystem[];
  grades: Grade[];
  currentUserId: string;
  currentUserRole: string;
}
