import { prisma } from "@/lib/prisma";
import { PenilaianClient } from "@/components/hrd/PenilaianClient";

export default async function PenilaianPage() {
  let assessments: any[] = [];
  let karyawanList: any[] = [];

  try {
    [assessments, karyawanList] = await Promise.all([
      prisma.assessment.findMany({
        include: {
          target: { select: { nama: true, jabatan: true, divisi: true } },
          penilai: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Karyawan list keyed by User.id (userId) — for target selection
      prisma.karyawan.findMany({
        include: { user: { select: { id: true, username: true } } },
        orderBy: { nama: "asc" },
      }),
    ]);
  } catch (error) {
    console.error("DB error:", error);
  }

  const assessmentData = assessments.map((a) => ({
    id: a.id,
    targetNama: a.target.nama,
    targetJabatan: a.target.jabatan,
    targetDivisi: a.target.divisi,
    penilaiUsername: a.penilai.username,
    jenis: a.jenis,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  }));

  // Map: userId as the primary id for targetId in forms
  const karyawanData = karyawanList.map((k) => ({
    userId: k.user.id,
    username: k.user.username,
    id: k.id,
    nama: k.nama,
    jabatan: k.jabatan,
    divisi: k.divisi,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Penilaian Kinerja</h1>
        <p className="text-gray-500 mt-1">
          Kelola penilaian kinerja karyawan 360°
        </p>
      </div>
      <PenilaianClient
        initialAssessments={assessmentData}
        karyawanList={karyawanData}
      />
    </div>
  );
}
