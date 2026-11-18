"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { createId, getGrades, getStudents, getSubjects, saveGrades, saveStudents, saveSubjects } from "@/services/storage";
import type { Subject } from "@/types";
import { BookOpen, Plus, Search, Pencil, Trash2, X } from "lucide-react";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(() => getSubjects());
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: "", code: "", workload: "60" });
  const [error, setError] = useState("");
  const filtered = useMemo(
    () => subjects.filter((s) => `${s.name} ${s.code}`.toLowerCase().includes(search.toLowerCase())),
    [subjects, search]
  );
  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", code: "", workload: "60" });
    setError("");
    setOpen(true);
  };
  const openEdit = (subject: Subject) => {
    setEditing(subject);
    setForm({ name: subject.name, code: subject.code, workload: String(subject.workload) });
    setError("");
    setOpen(true);
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    const workload = Number(form.workload);
    if (!form.name.trim() || !form.code.trim() || workload <= 0) {
      setError("Informe nome, código e carga horária válida.");
      return;
    }
    if (
      subjects.some(
        (subject) =>
          subject.code.toLowerCase() === form.code.trim().toLowerCase() && subject.id !== editing?.id
      )
    ) {
      setError("Já existe uma disciplina com este código.");
      return;
    }
    let next: Subject[];
    if (editing)
      next = subjects.map((subject) =>
        subject.id === editing.id
          ? { ...subject, name: form.name.trim(), code: form.code.trim().toUpperCase(), workload }
          : subject
      );
    else
      next = [
        ...subjects,
        { id: createId("subject"), name: form.name.trim(), code: form.code.trim().toUpperCase(), workload },
      ];
    saveSubjects(next);
    setSubjects(next);
    setOpen(false);
  };
  const remove = (subject: Subject) => {
    if (!window.confirm(`Excluir a disciplina ${subject.name}?`)) return;
    const next = subjects.filter((item) => item.id !== subject.id);
    saveSubjects(next);
    saveGrades(getGrades().filter((grade) => grade.subjectId !== subject.id));
    saveStudents(
      getStudents().map((student) => ({
        ...student,
        subjectIds: student.subjectIds.filter((id) => id !== subject.id),
      }))
    );
    setSubjects(next);
  };

  return (
    <AppShell title="Disciplinas" subtitle="Grade curricular">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Disciplinas</h1>
          <p className="mt-1 text-sm text-slate-500">Cadastre e mantenha a grade curricular</p>
        </div>
        <button
          onClick={openCreate}
          className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
        >
          <Plus size={18} />
          Nova disciplina
        </button>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar disciplina"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">Nenhuma disciplina encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-950/40">
                <tr>
                  <th className="px-5 py-3">Disciplina</th>
                  <th className="px-5 py-3">Código</th>
                  <th className="px-5 py-3">Carga horária</th>
                  <th className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((subject) => (
                  <tr key={subject.id}>
                    <td className="px-5 py-4 font-semibold">{subject.name}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold dark:bg-slate-800">
                        {subject.code}
                      </span>
                    </td>
                    <td className="px-5 py-4">{subject.workload} h</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(subject)}
                          className="rounded-lg p-2 text-slate-500 hover:text-indigo-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => remove(subject)}
                          className="rounded-lg p-2 text-slate-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{editing ? "Editar disciplina" : "Nova disciplina"}</h2>
              <button onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={save} className="mt-5 space-y-4">
              <label className="block text-sm font-medium">
                Nome
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-medium">
                  Código
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>
                <label className="text-sm font-medium">
                  Carga (h)
                  <input
                    type="number"
                    min="1"
                    value={form.workload}
                    onChange={(e) => setForm({ ...form, workload: e.target.value })}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>
              </div>
              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-11 rounded-xl border px-4 text-sm"
                >
                  Cancelar
                </button>
                <button className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}