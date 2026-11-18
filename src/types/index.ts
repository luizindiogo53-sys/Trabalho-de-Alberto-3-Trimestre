export type UserRole = "admin" | "aluno";

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  studentId?: string;
}

export interface Student {
  id: string;
  name: string;
  username: string;
  password: string;
  registration: string;
  email: string;
  subjectIds: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  workload: number;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  value: number;
}

export interface Session {
  userId: string;
  role: UserRole;
  name: string;
  studentId?: string;
}

export type AcademicStatus = "APROVADO" | "RECUPERAÇÃO" | "REPROVADO" | "Situação pendente de confirmação" | "Sem notas";

export interface TeamMember {
  name: string;
  imageUrl: string;
  githubUrl: string;
}

export interface TeamConfig {
  projectName: string;
  teamName: string;
  members: TeamMember[];
}
