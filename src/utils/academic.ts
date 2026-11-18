import type { Grade, AcademicStatus } from "@/types";

export function calculateAverage(grades: Grade[]): number | null {
  if (!grades.length) return null;
  const total = grades.reduce((sum, grade) => sum + grade.value, 0);
  return total / grades.length;
}

export function getAcademicStatus(average: number | null): AcademicStatus {
  if (average === null) return "Sem notas";
  if (average < 5) return "REPROVADO";
  if (average >= 5 && average < 6) return "Situação pendente de confirmação";
  if (average >= 6 && average < 7) return "RECUPERAÇÃO";
  return "APROVADO";
}

export function formatAverage(average: number | null): string {
  return average === null ? "Sem notas" : average.toFixed(1).replace(".", ",");
}
