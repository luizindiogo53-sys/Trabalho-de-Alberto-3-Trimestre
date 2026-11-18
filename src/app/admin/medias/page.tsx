"use client";

import Link from "next/link";
import { getGrades, getSubjects, getStudents } from "@/services/storage";
import { calculateAverage } from "@/utils/academic";

export default function AdminMedias() {
  const disciplinas = getStudents().flatMap((student) =>
    getSubjects().map((subject) => {
      const media = calculateAverage(
        getGrades().filter((grade) => grade.studentId === student.id && grade.subjectId === subject.id)
      );
      return { nome: `${subject.name} — ${student.name}`, media: media ?? 0 };
    })
  ).filter((entry) => entry.media !== 0);

  function situacao(media: number) {
    if (media < 5) return "Reprovado";
    if (media >= 5 && media < 7) return "Recuperação";
    if (media >= 7) return "Aprovado";
    return "Sem classificação";
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Consulta de Médias</h1>
          <Link
            href="/admin"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Voltar
          </Link>
        </div>

        <div className="bg-white p-6 shadow rounded">
          {disciplinas.length === 0 ? (
            <p className="text-gray-700">Nenhuma média cadastrada.</p>
          ) : (
            <div className="space-y-4">
              {disciplinas.map((item, index) => (
                <div key={index} className="border-b pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{item.nome}</h3>
                    <p className="text-sm text-gray-600">
                      Situação: {situacao(Number(item.media))}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-lg">
                      Média: {Number(item.media).toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}