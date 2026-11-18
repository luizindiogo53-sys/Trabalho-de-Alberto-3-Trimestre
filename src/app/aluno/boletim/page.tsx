"use client";

import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { calculateAverage, getAcademicStatus, formatAverage } from "@/utils/academic";
import { GraduationCap } from "lucide-react";
import { getGrades, getStudents, getSubjects } from "@/services/storage";

export default function ReportCard() {
  const { session } = useAuth();

  if (!session?.studentId) return null;

  const student = getStudents().find((item) => item.id === session.studentId) ?? null;
  if (!student) return null;

  const subjects = getSubjects();
  const grades = getGrades().filter((grade) => grade.studentId === session.studentId);
  const ownSubjects = subjects.filter((subject) => student.subjectIds.includes(subject.id));

  return (
    <AppShell title="Meu boletim" subtitle="Notas e situação acadêmica">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-white">
            <GraduationCap size={23} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              Boletim escolar
            </p>
            <h1 className="mt-1 text-xl font-bold">{student?.name || session?.name}</h1>
            <p className="text-sm text-slate-500">Matrícula {student?.registration || "—"}</p>
          </div>
        </div>
        {ownSubjects.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Nenhuma disciplina disponível.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-950/40">
                <tr>
                  <th className="px-5 py-3">Disciplina</th>
                  <th className="px-5 py-3">Notas</th>
                  <th className="px-5 py-3">Média</th>
                  <th className="px-5 py-3">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ownSubjects.map((subject) => {
                  const ownGrades = grades.filter((grade) => grade.subjectId === subject.id);
                  const average = calculateAverage(ownGrades);
                  const status = getAcademicStatus(average);
                  const badge =
                    status === "APROVADO"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : status === "RECUPERAÇÃO"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                      : status === "REPROVADO"
                      ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
                  return (
                    <tr key={subject.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold">{subject.name}</p>
                        <p className="text-xs text-slate-500">
                          {subject.code} • {subject.workload}h
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {ownGrades.length
                          ? ownGrades.map((grade) => grade.value.toFixed(1).replace(".", ","))
                              .join("  •  ")
                          : "—"}
                      </td>
                      <td className="px-5 py-4 font-bold">{formatAverage(average)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
