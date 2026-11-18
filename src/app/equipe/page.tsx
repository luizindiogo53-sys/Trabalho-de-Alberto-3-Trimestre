"use client";

import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { getTeam, initializeStorage, saveTeam } from "@/services/storage";
import { ExternalLink, GitBranch, GraduationCap, Save, Users } from "lucide-react";
import type { TeamConfig, TeamMember } from "@/types";
import { INITIAL_TEAM } from "@/data/mock";

function loadTeam(): TeamConfig {
  initializeStorage();
  const stored = getTeam();
  const legacyMembers = stored.members as unknown;
  if (Array.isArray(legacyMembers) && legacyMembers.every((member) => typeof member === "string")) {
    const names = legacyMembers as string[];
    return {
      ...stored,
      members: names.map((name): TeamMember => {
        const initialMember = INITIAL_TEAM.members.find((member) => member.name === name);
        return {
          name,
          imageUrl: initialMember?.imageUrl || "",
          githubUrl: initialMember?.githubUrl || "",
        };
      }),
    };
  }
  if (!Array.isArray(legacyMembers) || legacyMembers.length === 0) {
    return { ...stored, members: INITIAL_TEAM.members };
  }
  return {
    ...stored,
    members: stored.members.map((member) => ({
      ...member,
      imageUrl:
        member.imageUrl ||
        INITIAL_TEAM.members.find((initialMember) => initialMember.name === member.name)?.imageUrl ||
        "",
    })),
  };
}

export default function TeamPage() {
  const [team, setTeam] = useState(loadTeam);
  const [saved, setSaved] = useState(false);

  const save = (event: FormEvent) => {
    event.preventDefault();
    saveTeam(team);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };
  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    setTeam((current) => ({
      ...current,
      members: current.members.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      ),
    }));
  };
  const uploadMemberPhoto = (index: number, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => updateMember(index, "imageUrl", String(reader.result || ""));
    reader.readAsDataURL(file);
  };
  return (
    <AppShell title="Equipe" subtitle="Identificação do projeto">
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-white">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
                Apresentação
              </p>
              <h1 className="mt-1 text-2xl font-bold">{team.projectName}</h1>
            </div>
          </div>
          <p className="mt-6 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
            O ETEon é o portal acadêmico das Escolas Técnicas de Pernambuco,
            desenvolvido para organizar alunos, disciplinas, notas e resultados
            escolares em uma experiência moderna e acessível.
          </p>
          <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              <h2 className="font-semibold">{team.teamName}</h2>
              <span className="ml-auto rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                Turma 2DS A
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {team.members.length ? (
                team.members.map((member, index) => (
                  <article
                    key={`${member.name}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800"
                  >
                    {member.imageUrl ? (
                      <div
                        role="img"
                        aria-label={`Foto de ${member.name}`}
                        style={{ backgroundImage: `url("${member.imageUrl}")` }}
                        className="h-14 w-14 shrink-0 rounded-full bg-cover bg-center ring-2 ring-slate-100 dark:ring-slate-800"
                      />
                    ) : (
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-100 text-lg font-bold text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{member.name}</p>
                      {member.githubUrl ? (
                        <a
                          href={member.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          <GitBranch size={14} /> GitHub <ExternalLink size={11} />
                        </a>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">GitHub não informado</p>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-full rounded-xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-950">
                  Configure os nomes dos integrantes ao lado.
                </div>
              )}
            </div>
          </div>
        </section>
        <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold">Configurar apresentação</h2>
          <form onSubmit={save} className="mt-5 space-y-4">
            <label className="block text-sm font-medium">
              Nome do projeto
              <input
                value={team.projectName}
                onChange={(e) =>
                  setTeam({ ...team, projectName: e.target.value })
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <label className="block text-sm font-medium">
              Nome da equipe
              <input
                value={team.teamName}
                onChange={(e) => setTeam({ ...team, teamName: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <div className="space-y-3">
              {team.members.map((member, index) => (
                <fieldset
                  key={`${member.name}-${index}`}
                  className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                >
                  <legend className="px-1 text-xs font-semibold text-slate-500">
                    Integrante {index + 1}
                  </legend>
                  <label className="block text-xs font-medium">
                    Nome
                    <input
                      value={member.name}
                      onChange={(event) => updateMember(index, "name", event.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />
                  </label>
                  <label className="mt-2 block text-xs font-medium">
                    URL da foto
                    <input
                      type="url"
                      value={member.imageUrl}
                      placeholder="https://..."
                      onChange={(event) => updateMember(index, "imageUrl", event.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />
                  </label>
                  <label className="mt-2 block text-xs font-medium">
                    Link do GitHub
                    <input
                      type="url"
                      value={member.githubUrl}
                      onChange={(event) => updateMember(index, "githubUrl", event.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />
                  </label>
                  <label className="mt-2 block text-xs font-medium">
                    Foto local
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        uploadMemberPhoto(index, file);
                      }}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />
                  </label>
                  <label className="mt-2 block text-xs font-medium">
                    Ou envie uma foto do dispositivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => uploadMemberPhoto(index, event.target.files?.[0])}
                      className="mt-1 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-200"
                    />
                  </label>
                </fieldset>
              ))}
            </div>
            {saved && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Equipe atualizada.
              </p>
            )}
            <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white">
              <Save size={17} />
              Salvar configuração
            </button>
          </form>
        </aside>
      </div>
    </AppShell>
  );
}
