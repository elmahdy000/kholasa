import type { Role } from "@prisma/client";

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
  phone: string;
  email?: string | null;
  password: string;
  role?: Role;
  systemId?: string | null;
  gradeId?: string | null;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  email?: string;
  role?: Role;
  systemId?: string | null;
  gradeId?: string | null;
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
}
