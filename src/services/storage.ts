import { ADMIN_USER, INITIAL_GRADES, INITIAL_STUDENTS, INITIAL_SUBJECTS, INITIAL_TEAM } from "@/data/mock";
import type { Grade, Session, Student, Subject, TeamConfig, User } from "@/types";

export const STORAGE_KEYS = {
  users: "escola.users",
  students: "escola.students",
  subjects: "escola.subjects",
  grades: "escola.grades",
  session: "escola.session",
  theme: "escola.theme",
  team: "escola.team",
  legacyAccounts: "contas",
  mockRosterMigration: "escola.mockRosterMigration.v2",
  teamMembersMigration: "escola.teamMembersMigration.v1",
} as const;

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function readStorage<T>(key: string, fallback: T): T {
  const storage = getBrowserStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    storage.removeItem(key);
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  const storage = getBrowserStorage();
  if (storage) storage.setItem(key, JSON.stringify(value));
}

export function initializeStorage(): void {
  const storage = getBrowserStorage();
  if (!storage) return;

  if (!storage.getItem(STORAGE_KEYS.users)) {
    const users: User[] = [ADMIN_USER, ...INITIAL_STUDENTS.map((student) => ({
      id: `user-${student.id}`, name: student.name, username: student.username,
      password: student.password, role: "aluno" as const, studentId: student.id,
    }))];
    writeStorage(STORAGE_KEYS.users, users);
  }
  if (!storage.getItem(STORAGE_KEYS.students)) writeStorage(STORAGE_KEYS.students, INITIAL_STUDENTS);
  if (!storage.getItem(STORAGE_KEYS.subjects)) writeStorage(STORAGE_KEYS.subjects, INITIAL_SUBJECTS);
  if (!storage.getItem(STORAGE_KEYS.grades)) writeStorage(STORAGE_KEYS.grades, INITIAL_GRADES);
  if (!storage.getItem(STORAGE_KEYS.team)) {
    writeStorage(STORAGE_KEYS.team, INITIAL_TEAM);
  } else {
    const storedTeam = getTeam();
    const rawMembers = storedTeam.members as unknown;
    if (!Array.isArray(rawMembers) || rawMembers.length !== INITIAL_TEAM.members.length || !rawMembers.every((member) => typeof member === "object" && member !== null && "name" in member && "imageUrl" in member && "githubUrl" in member)) {
      writeStorage(STORAGE_KEYS.team, INITIAL_TEAM);
    }
  }
  if (!storage.getItem(STORAGE_KEYS.mockRosterMigration)) {
    const currentStudents = getStudents();
    const currentUsers = getUsers();
    const migratedStudents = INITIAL_STUDENTS.map((mockStudent, index) => {
      const existing = currentStudents[index];
      if (!existing) return mockStudent;
      return {
        ...existing,
        name: mockStudent.name,
        username: mockStudent.username,
        password: mockStudent.password,
        registration: mockStudent.registration,
        email: mockStudent.email,
        subjectIds: existing.subjectIds.length ? existing.subjectIds : mockStudent.subjectIds,
      };
    });

    const extraStudents = currentStudents.slice(INITIAL_STUDENTS.length);
    saveStudents([...migratedStudents, ...extraStudents]);

    const adminUsers = currentUsers.filter((user) => user.role === "admin");
    const migratedUsers: User[] = migratedStudents.map((student, index) => {
      const existing = currentUsers.find((user) => user.studentId === currentStudents[index]?.id);
      return {
        id: existing?.id || `user-${student.id}`,
        name: student.name,
        username: student.username,
        password: student.password,
        role: "aluno",
        studentId: student.id,
      };
    });
    saveUsers([...adminUsers, ...migratedUsers]);
    storage.setItem(STORAGE_KEYS.mockRosterMigration, "completed");
  }
  if (!storage.getItem(STORAGE_KEYS.teamMembersMigration)) {
    const previousTeam = getTeam();
    const previousMembers = previousTeam.members as unknown;
    const migratedMembers = INITIAL_TEAM.members.map((initialMember, index) => {
      const previousMember = Array.isArray(previousMembers) ? previousMembers[index] : undefined;
      const previousImage = typeof previousMember === "object" && previousMember !== null && "imageUrl" in previousMember
        ? String(previousMember.imageUrl || "")
        : "";
      return { ...initialMember, imageUrl: previousImage };
    });
    writeStorage(STORAGE_KEYS.team, {
      ...previousTeam,
      projectName: "ETEon",
      teamName: "Equipe 2DS A",
      members: migratedMembers,
    });
    storage.setItem(STORAGE_KEYS.teamMembersMigration, "completed");
  } else if (!storage.getItem(STORAGE_KEYS.team)) {
    writeStorage(STORAGE_KEYS.team, INITIAL_TEAM);
  }
}

export function getUsers(): User[] { return readStorage(STORAGE_KEYS.users, []); }
export function getStudents(): Student[] { return readStorage(STORAGE_KEYS.students, []); }
export function getSubjects(): Subject[] { return readStorage(STORAGE_KEYS.subjects, []); }
export function getGrades(): Grade[] { return readStorage(STORAGE_KEYS.grades, []); }
export function getSession(): Session | null { return readStorage<Session | null>(STORAGE_KEYS.session, null); }
export function getTeam(): TeamConfig { return readStorage(STORAGE_KEYS.team, INITIAL_TEAM); }

export function saveStudents(students: Student[]): void { writeStorage(STORAGE_KEYS.students, students); }
export function saveSubjects(subjects: Subject[]): void { writeStorage(STORAGE_KEYS.subjects, subjects); }
export function saveGrades(grades: Grade[]): void { writeStorage(STORAGE_KEYS.grades, grades); }
export function saveUsers(users: User[]): void { writeStorage(STORAGE_KEYS.users, users); }
export function saveSession(session: Session | null): void {
  if (session) writeStorage(STORAGE_KEYS.session, session); else getBrowserStorage()?.removeItem(STORAGE_KEYS.session);
}
export function saveTeam(team: TeamConfig): void { writeStorage(STORAGE_KEYS.team, team); }

export function createId(prefix: string): string {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

export interface RegistrationData {
  name: string;
  username: string;
  password: string;
  role: "admin" | "aluno";
  registration?: string;
  email?: string;
}

export function registerAccount(data: RegistrationData): { success: boolean; message: string } {
  initializeStorage();
  const users = getUsers();
  const cleanUsername = data.username.trim();
  if (!cleanUsername || !data.password || !data.name.trim()) {
    return { success: false, message: "Preencha todos os campos obrigatórios." };
  }
  if (users.some((user) => user.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return { success: false, message: "Esse usuário já existe!" };
  }

  if (data.role === "aluno") {
    const studentId = createId("student");
    const student: Student = {
      id: studentId,
      name: data.name.trim(),
      username: cleanUsername,
      password: data.password,
      registration: data.registration?.trim() || createId("mat").slice(-8).toUpperCase(),
      email: data.email?.trim() || `${cleanUsername}@eteon.com.br`,
      subjectIds: getSubjects().map((subject) => subject.id),
    };
    const user: User = {
      id: createId("user"),
      name: student.name,
      username: student.username,
      password: student.password,
      role: "aluno",
      studentId,
    };
    saveStudents([...getStudents(), student]);
    saveUsers([...users, user]);
  } else {
    const user: User = {
      id: createId("user"),
      name: data.name.trim(),
      username: cleanUsername,
      password: data.password,
      role: "admin",
    };
    saveUsers([...users, user]);
  }

  const legacy = readStorage<Array<{ nome: string; usuario: string; senha: string; tipo: "admin" | "aluno"; cpf?: string; matricula?: string }>>(STORAGE_KEYS.legacyAccounts, []);
  const nextLegacy = legacy.filter((account) => account.usuario.toLowerCase() !== cleanUsername.toLowerCase());
  nextLegacy.push({ nome: data.name.trim(), usuario: cleanUsername, senha: data.password, tipo: data.role, matricula: data.registration });
  writeStorage(STORAGE_KEYS.legacyAccounts, nextLegacy);
  return { success: true, message: "Cadastro realizado com sucesso." };
}
