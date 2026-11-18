import type { Student, Subject, User, Grade, TeamConfig } from "@/types";

export const ADMIN_USER: User = {
  id: "user-admin", name: "Administrador", username: "admin", password: "admin123", role: "admin",
};

export const INITIAL_SUBJECTS: Subject[] = [
  { id: "subj-mat", name: "Matemática", code: "MAT101", workload: 80 },
  { id: "subj-port", name: "Português", code: "POR101", workload: 80 },
  { id: "subj-hist", name: "História", code: "HIS101", workload: 60 },
  { id: "subj-fis", name: "Física", code: "FIS101", workload: 60 },
  { id: "subj-info", name: "Informática", code: "INF101", workload: 80 },
];

export const INITIAL_STUDENTS: Student[] = [
  ["Eduardo Coutinho", "eduardo.coutinho", "2026001"],
  ["Luís Diogo", "luis.diogo", "2026002"],
  ["Pedro Ricardo", "pedro.ricardo", "2026003"],
  ["Anthony Eduardo", "anthony.eduardo", "2026004"],
  ["Iago Henrique", "iago.henrique", "2026005"],
  ["Pedro Henrique de Medeiros", "pedro.henrique.medeiros", "2026006"],
  ["Pedro Marques", "pedro.marques", "2026007"],
  ["João Paulo", "joao.paulo", "2026008"],
  ["Pedro Inácio", "pedro.inacio", "2026009"],
  ["Ruan Carlos", "ruan.carlos", "2026010"],
  ["Allana Dias", "allana.dias", "2026011"],
  ["Rodrigo Figueredo", "rodrigo.figueredo", "2026012"],
].map(([name, username, registration], index) => ({
  id: `student-${index + 1}`,
  name,
  username,
  password: `aluno${index + 1}`,
  registration,
  email: `${username}@eteon.com.br`,
  subjectIds: INITIAL_SUBJECTS.map((subject) => subject.id),
}));

export const INITIAL_GRADES: Grade[] = INITIAL_STUDENTS.flatMap((student, studentIndex) =>
  INITIAL_SUBJECTS.map((subject, subjectIndex) => {
    const values = [8.2, 6.5, 4.8, 7.4, 5.7, 9.1, 6.8, 3.9, 7.8, 5.9, 8.6, 7.1];
    return { id: `grade-${studentIndex}-${subjectIndex}`, studentId: student.id, subjectId: subject.id, value: values[studentIndex] - ((subjectIndex % 2) * 0.3) };
  })
);

export const INITIAL_TEAM: TeamConfig = {
  projectName: "ETEon",
  teamName: "Equipe 2DS A",
  members: [
    { name: "Luís Diogo", imageUrl: "/images/equipe/luis-diogo.jpeg", githubUrl: "https://github.com/luizindiogo53-sys" },
    { name: "João Paulo", imageUrl: "/images/equipe/joao-paulo.jpeg", githubUrl: "https://github.com/jhoaoPL" },
    { name: "Allana Dias", imageUrl: "/images/equipe/allana-dias.jpeg", githubUrl: "https://github.com/allanadias-gf" },
    { name: "Rodrigo Figueiredo", imageUrl: "/images/equipe/rodrigo-figueiredo.jpeg", githubUrl: "https://github.com/rdefigueiredo65-bot" },
    { name: "Ruan Carlos", imageUrl: "/images/equipe/ruan-carlos.jpeg", githubUrl: "https://github.com/ruancarlos009" },
  ],
};
