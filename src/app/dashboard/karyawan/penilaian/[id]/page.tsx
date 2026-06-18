import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AKHLAKFormClient } from "@/components/AKHLAKFormClient";

export default async function KaryawanPenilaianDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let assessment = null;

  try {
    assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: {
        target: { select: { nama: true, jabatan: true, divisi: true } },
        penilai: { select: { username: true } },
        formEntries: true,
      },
    });
  } catch (error) {
    console.error("DB error:", error);
  }

  if (!assessment) return notFound();

  const formData = assessment.formEntries.map((f) => ({
    indikator: f.indikator,
    nilai: f.nilai,
  }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Form Penilaian AKHLAK</h1>
        <p className="text-gray-500 mt-1">
          Penilaian untuk{" "}
          <span className="font-medium text-gray-700">{assessment.target.nama}</span>
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Karyawan Dinilai</p>
            <p className="font-medium text-gray-900">{assessment.target.nama}</p>
          </div>
          <div>
            <p className="text-gray-500">Jabatan</p>
            <p className="font-medium text-gray-900">{assessment.target.jabatan}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className={`font-medium ${assessment.status === "COMPLETED" ? "text-green-600" : "text-amber-600"}`}>
              {assessment.status === "COMPLETED" ? "Sudah Dinilai" : "Belum Dinilai"}
            </p>
          </div>
        </div>
      </div>

      <AKHLAKFormClient
        assessmentId={assessment.id}
        initialEntries={formData}
        isCompleted={assessment.status === "COMPLETED"}
        backUrl="/dashboard/karyawan/penilaian"
      />
    </div>
  );
}
