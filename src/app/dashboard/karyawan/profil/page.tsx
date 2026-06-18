import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Building2, Calendar, TrendingUp, Shield } from "lucide-react";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const karyawan = await prisma.karyawan.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
      assessmentResults: {
        orderBy: { calculatedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!karyawan) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#16a34a] via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-green-600/20">
          <h1 className="text-xl font-bold text-white">Profil Saya</h1>
          <p className="text-green-100 text-sm mt-0.5">Informasi profil karyawan</p>
        </div>
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="pt-6 text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-600">Data profil tidak ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">Hubungi HRD untuk bantuan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestResult = karyawan.assessmentResults[0];
  const isHRD = karyawan.user.role === "HRD";

  const akhlakScores = latestResult ? [
    { label: "Amanah", value: latestResult.amanah, color: "from-blue-400 to-blue-600" },
    { label: "Kompeten", value: latestResult.kompeten, color: "from-purple-400 to-purple-600" },
    { label: "Harmonis", value: latestResult.harmonis, color: "from-green-400 to-green-600" },
    { label: "Loyal", value: latestResult.loyal, color: "from-red-400 to-red-600" },
    { label: "Adaptif", value: latestResult.adaptif, color: "from-amber-400 to-amber-600" },
    { label: "Kolaboratif", value: latestResult.kolaboratif, color: "from-teal-400 to-teal-600" },
  ] : [];

  const nilaiColor = latestResult
    ? latestResult.nilaiAkhir >= 4 ? "text-green-500" : latestResult.nilaiAkhir >= 3 ? "text-amber-500" : "text-red-500"
    : "text-gray-400";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#16a34a] via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-green-600/20">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {karyawan.nama.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Profil Saya</h1>
            <p className="text-green-100 text-sm mt-0.5">
              {karyawan.nama} · {karyawan.jabatan}
            </p>
          </div>
          <div className="ml-auto hidden sm:block">
            <Badge className={`${isHRD ? "bg-purple-500/30 text-purple-100 border-purple-400/40" : "bg-white/20 text-white"} backdrop-blur`}>
              {isHRD ? (
                <><Shield className="w-3 h-3 mr-1" />Admin HRD</>
              ) : "Karyawan"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Profile + Score Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Card */}
        <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: User, label: "Nama Lengkap", value: karyawan.nama },
              { icon: null, label: "Username", value: `@${karyawan.user.username}` },
              { icon: Mail, label: "Email", value: karyawan.user.email || "—" },
              { icon: Building2, label: "Divisi", value: karyawan.divisi },
              { icon: null, label: "Jabatan", value: karyawan.jabatan },
              { icon: Calendar, label: "Bergabung", value: new Date(karyawan.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.icon && <item.icon className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                {!item.icon && <div className="w-4" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AKHLAK Score Card */}
        <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              Nilai AKHLAK Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestResult ? (
              <div>
                <div className="flex items-end gap-3 mb-5">
                  <p className={`text-4xl font-bold ${nilaiColor}`}>
                    {latestResult.nilaiAkhir.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 pb-1">/ 5.00</p>
                  <Badge className={`ml-auto mb-0.5 ${latestResult.nilaiAkhir >= 4 ? "bg-green-100 text-green-700" : latestResult.nilaiAkhir >= 3 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {latestResult.nilaiAkhir >= 4 ? "Baik" : latestResult.nilaiAkhir >= 3 ? "Cukup" : "Perlu Perbaikan"}
                  </Badge>
                </div>
                <div className="space-y-2.5">
                  {akhlakScores.map((score) => (
                    <div key={score.label} className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 w-20 truncate">{score.label}</p>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${score.color}`}
                          style={{ width: `${(score.value / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 w-6 text-right">{score.value.toFixed(1)}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Tanggal: {new Date(latestResult.calculatedAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-7 h-7 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-500">Belum Ada Nilai</p>
                <p className="text-xs text-gray-400 mt-1">Nilai muncul setelah penilaian selesai</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-blue-800 text-sm">Informasi Profil</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Untuk mengubah informasi profil atau kata sandi, silakan hubungi admin HRD.
          </p>
        </div>
      </div>
    </div>
  );
}
