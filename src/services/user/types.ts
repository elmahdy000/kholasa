import type { Role, SchoolCategory } from "@prisma/client";

export interface UserFilterParams {
  role?: Role | "ALL";
  search?: string;
  systemId?: string;
  gradeId?: string;
  page?: number;
  limit?: number;
}

export interface CreateUserInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  password?: string;
  loginCode?: string;
  role?: Role;
  systemId?: string | null;
  gradeId?: string | null;
  schoolCategory?: SchoolCategory;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  loginCode?: string;
  role?: Role;
  systemId?: string | null;
  gradeId?: string | null;
  trackId?: string | null;
  schoolCategory?: SchoolCategory;
  maxDevices?: number;
}

export interface StudentProfileUpdateInput {
  name?: string;
  phone?: string;
  gradeId?: string;
  systemId?: string;
  avatar?: string;
}

export interface RegisterStudentInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  password: string;
  systemId?: string | null;
  gradeId?: string | null;
  deviceId?: string | null;
}
