"use client";

import Link from "next/link";
import { useState } from "react";
import { Users, BookOpen, CircleCheck, CircleAlert, CircleX, ArrowUpRight, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getGrades, getStudents, getSubjects, initializeStorage } from "@/services/storage";
import { calculateAverage, getAcademicStatus } from "@/utils/academic";
import type { Grade, Student } from "@/types";

export default function AdminDashboard() {
  initializeStorage();
  const [students] = useState<Student[]>(() => getStudents());
  const [subjectsCount] = useState(() => getSubjects().length);
  const [grades] = useState<Grade[]>(() => getGrades());

  const statuses = students.map((student) => getAcademicStatus(calculateAverage(grades.filter((grade) => grade.studentId === student.id))));
  const countStatus = (status: string) => statuses.filter((item) => item === status).length;
  const cards = [
    { label: "Total de alunos", value: students.length, icon: Users, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300" },
    { label: "Disciplinas", value: subjectsCount, icon: BookOpen, color: "text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-300" },
    { label: "Aprovados", value: countStatus("APROVADO"), icon: CircleCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300" },
    { label: "Em recuperação", value: countStatus("RECUPERAÇÃO"), icon: CircleAlert, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300" },
    { label: "Reprovados", value: countStatus("REPROVADO"), icon: CircleX, color: "text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-300" },
  ];

  return <AppShell title="Visão geral" subtitle="Painel administrativo">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-slate-500 dark:text-slate-400">Bem-vindo de volta</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Painel administrativo</h1></div><Link href="/admin/alunos" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/15 hover:bg-indigo-700"><Plus size={18} />Novo aluno</Link></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className={`grid h-10 w-10 place-items-center rounded-xl ${card.color}`}><Icon size={19} /></div><p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{card.label}</p><p className="mt-1 text-3xl font-bold tracking-tight">{card.value}</p></div>; })}</div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800"><div><h2 className="font-semibold">Alunos cadastrados</h2><p className="mt-0.5 text-xs text-slate-500">Resumo acadêmico atualizado</p></div><Link href="/admin/alunos" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Ver todos <ArrowUpRight className="inline" size={14} /></Link></div>
        {students.length === 0 ? <div className="py-12 text-center text-sm text-slate-500">Nenhum aluno cadastrado.</div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-950/40"><tr><th className="px-5 py-3 font-medium">Aluno</th><th className="px-5 py-3 font-medium">Matrícula</th><th className="px-5 py-3 font-medium">Média</th><th className="px-5 py-3 font-medium">Situação</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{students.slice(0, 8).map((student) => { const average = calculateAverage(grades.filter((grade) => grade.studentId === student.id)); const status = getAcademicStatus(average); const styles = status === "APROVADO" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : status === "RECUPERAÇÃO" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : status === "REPROVADO" ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"; return <tr key={student.id}><td className="px-5 py-3"><p className="font-medium">{student.name}</p><p className="text-xs text-slate-500">@{student.username}</p></td><td className="px-5 py-3 text-slate-500">{student.registration}</td><td className="px-5 py-3 font-semibold">{average === null ? "—" : average.toFixed(1).replace(".", ",")}</td><td className="px-5 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>{status}</span></td></tr>; })}</tbody></table></div>}
      </section>
      <aside className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h2 className="mb-1 px-1 pt-1 font-semibold">Atalhos</h2>{[{href:"/admin/alunos",label:"Cadastrar aluno",icon:Users},{href:"/admin/disciplinas",label:"Gerenciar disciplinas",icon:BookOpen},{href:"/admin/notas",label:"Lançar notas",icon:CircleCheck}].map((item)=>{const Icon=item.icon;return<Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm font-medium transition hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-slate-800 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/5"><div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Icon size={17}/></div>{item.label}<ArrowUpRight className="ml-auto text-slate-400" size={15}/></Link>;})}</aside>
    </div>
  </AppShell>;
}
