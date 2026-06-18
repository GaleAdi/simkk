import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KaryawanPenilaianClient } from "@/components/karyawan/KaryawanPenilaianClient";

export default async function KaryawanPenilaianPage() {
  const session = await getServerSession(authOptions);
  let assessments: any[] = [];
  let karyawanList: any[] = [];

  try {
    [assessments, karyawanList] = await Promise.all([
      prisma.assessment.findMany({
        where: { penilaiId: session?.user.id },
        include: {
          target: { select: { nama: true, jabatan: true, divisi: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      // All karyawan for target selection
      prisma.karyawan.findMany({
        include: { user: { select: { id: true, username: true } } },
        orderBy: { nama: "asc" },
      }),
    ]);
  } catch (error) {
    console.error("DB error:", error);
  }

  const data = assessments.map((a) => ({
    id: a.id,
    targetNama: a.target.nama,
    targetJabatan: a.target.jabatan,
    targetDivisi: a.target.divisi,
    jenis: a.jenis,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  }));

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
          Kelola dan isi penilaian kinerja sebagai penilai
        </p>
      </div>
      <KaryawanPenilaianClient
        initialAssessments={data}
        karyawanList={karyawanData}
      />
    </div>
  );
}
