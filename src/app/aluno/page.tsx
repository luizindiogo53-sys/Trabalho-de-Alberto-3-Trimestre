"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { getGrades, getStudents, getSubjects } from "@/services/storage";
import { calculateAverage, getAcademicStatus } from "@/utils/academic";
import type { Grade, Student, Subject } from "@/types";
import { BookOpen, Gauge, ClipboardCheck, ArrowRight } from "lucide-react";

export default function StudentDashboard() {
  const { session } = useAuth();
  const studentId = session?.studentId;
  const [student] = useState<Student | null>(() =>
    studentId ? getStudents().find((item) => item.id === studentId) || null : null
  );
  const [subjects] = useState<Subject[]>(() => getSubjects());
  const [grades] = useState<Grade[]>(() =>
    studentId ? getGrades().filter((grade) => grade.studentId === studentId) : []
  );

  if (!session?.studentId) return null;

  const ownSubjects = subjects.filter((subject) => student?.subjectIds.includes(subject.id));
  const averages = ownSubjects
    .map((subject) => calculateAverage(grades.filter((grade) => grade.subjectId === subject.id)))
    .filter((average): average is number => average !== null);
  const general = averages.length ? averages.reduce((sum, average) => sum + average, 0) / averages.length : null;
  const status = getAcademicStatus(general);

  return (
    <AppShell title="Meu painel" subtitle="Acompanhamento acadêmico">
      <div className="mb-7">
        <p className="text-sm text-slate-500">Bem-vindo de volta</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          Olá, {student?.name || session?.name}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <BookOpen size={19} />
          </div>
          <p className="mt-5 text-sm text-slate-500">Disciplinas</p>
          <p className="mt-1 text-3xl font-bold">{ownSubjects.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
            <Gauge size={19} />
          </div>
          <p className="mt-5 text-sm text-slate-500">Média geral</p>
          <p className="mt-1 text-3xl font-bold">
            {general === null ? "Sem notas" : general.toFixed(1).replace(".", ",")}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
            <ClipboardCheck size={19} />
          </div>
          <p className="mt-5 text-sm text-slate-500">Situação</p>
          <p className="mt-2 text-sm font-bold">{status}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="font-semibold">Últimas informações acadêmicas</h2>
          </div>
          {ownSubjects.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Nenhuma disciplina vinculada.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {ownSubjects.slice(0, 6).map((subject) => {
                const average = calculateAverage(grades.filter((grade) => grade.subjectId === subject.id));
                const subjectStatus = getAcademicStatus(average);

                return (
                  <div key={subject.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{subject.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {average === null ? "Sem notas" : average.toFixed(1).replace(".", ",")}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{subjectStatus}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        <aside className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-800 to-red-700 p-6 text-white shadow-xl shadow-blue-900/10">
          <p className="text-sm text-indigo-100">Boletim escolar</p>
          <h2 className="mt-2 text-xl font-bold">Consulte seu desempenho completo</h2>
          <p className="mt-3 text-sm leading-6 text-indigo-100">
            Veja notas, médias e situação acadêmica em todas as disciplinas.
          </p>
          <Link
            href="/aluno/boletim"
            className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-indigo-700"
          >
            Abrir boletim
            <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
    </AppShell>
  );
}
