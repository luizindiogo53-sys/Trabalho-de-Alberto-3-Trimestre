"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getGrades, getSubjects } from "@/services/storage";

export default function Aluno() {
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const nome = session?.name || "Aluno";
  const escuro = theme === "dark";
  const disciplinas = getSubjects();
  const medias = getGrades();

  function alternarTema() {
    toggleTheme();
  }

  function sair() {
    logout();
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        escuro ? "bg-[#111827]" : "bg-gray-50"
      }`}
    >
      <header
        className={`border-b ${
          escuro
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-100"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className={`text-xl font-bold ${
              escuro ? "text-white" : "text-gray-900"
            }`}>
              ETEon
            </h1>

            <p className={`text-xs mt-1 ${
              escuro ? "text-gray-400" : "text-gray-500"
            }`}>
              Área do aluno
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={alternarTema}
              className={`p-2.5 rounded-lg text-sm ${
                escuro
                  ? "bg-gray-800 text-yellow-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {escuro ? "☀" : "☾"}
            </button>

            <button
              onClick={sair}
              className={`text-sm font-medium px-3 py-2 rounded-lg ${
                escuro
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">

        <section className="mb-10">
          <p className={`text-sm mb-2 ${
            escuro ? "text-gray-400" : "text-gray-500"
          }`}>
            Bem-vindo ao seu painel
          </p>

          <h2 className={`text-3xl font-bold ${
            escuro ? "text-white" : "text-gray-900"
          }`}>
            Olá, {nome}!
          </h2>

          <p className={`mt-2 text-sm ${
            escuro ? "text-gray-400" : "text-gray-500"
          }`}>
            Acompanhe suas disciplinas e seu desempenho escolar.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">

          <div className={`rounded-2xl border p-6 ${
            escuro
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-100"
          }`}>
            <div className="flex justify-between items-center">
              <p className={`text-sm ${
                escuro ? "text-gray-400" : "text-gray-500"
              }`}>
                Disciplinas
              </p>

              <span className="text-green-500 text-xl">▤</span>
            </div>

            <p className="text-3xl font-bold text-green-500 mt-4">
              {disciplinas.length}
            </p>
          </div>

          <div className={`rounded-2xl border p-6 ${
            escuro
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-100"
          }`}>
            <div className="flex justify-between items-center">
              <p className={`text-sm ${
                escuro ? "text-gray-400" : "text-gray-500"
              }`}>
                Médias cadastradas
              </p>

              <span className="text-green-500 text-xl">▥</span>
            </div>

            <p className="text-3xl font-bold text-green-500 mt-4">
              {medias.length}
            </p>
          </div>

        </section>

        <section>
          <div className="flex justify-between items-center mb-5">
            <h3 className={`text-lg font-bold ${
              escuro ? "text-white" : "text-gray-900"
            }`}>
              Minhas disciplinas
            </h3>

            <span className={`text-xs ${
              escuro ? "text-gray-500" : "text-gray-400"
            }`}>
              {disciplinas.length} cadastradas
            </span>
          </div>

          <div className={`rounded-2xl border p-6 ${
            escuro
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-100"
          }`}>
            {disciplinas.length === 0 ? (
              <div className="text-center py-8">
                <p className={`text-sm ${
                  escuro ? "text-gray-400" : "text-gray-500"
                }`}>
                  Nenhuma disciplina cadastrada ainda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {disciplinas.map((disciplina, index) => (
                  <div
                    key={disciplina.id ?? index}
                    className={`p-4 rounded-xl border ${
                      escuro
                        ? "bg-gray-800 border-gray-700"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <p className={`font-medium text-sm ${
                      escuro ? "text-gray-100" : "text-gray-800"
                    }`}>
                      {typeof disciplina === "string"
                        ? disciplina
                        : disciplina.name || "Disciplina"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className={`text-center text-xs mt-12 ${
          escuro ? "text-gray-600" : "text-gray-400"
        }`}>
          ETEon © 2026 — Área do aluno
        </footer>

      </div>
    </main>
  );
}
