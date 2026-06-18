"use client";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Clock, TrendingUp, User, ArrowRight } from "lucide-react";

export default async function KaryawanDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const karyawan = await prisma.karyawan.findUnique({
    where: { userId: session.user.id },
    include: {
      assessmentsReceived: {
        where: { status: "PENDING" },
        take: 5,
      },
      assessmentResults: {
        orderBy: { calculatedAt: "desc" },
        take: 1,
      },
    },
  });

  const latestResult = karyawan?.assessmentResults[0];

  const akhlakScores = latestResult ? [
    { label: "Amanah", value: latestResult.amanah, color: "from-blue-400 to-blue-600" },
    { label: "Kompeten", value: latestResult.kompeten, color: "from-purple-400 to-purple-600" },
    { label: "Harmonis", value: latestResult.harmonis, color: "from-green-400 to-green-600" },
    { label: "Loyal", value: latestResult.loyal, color: "from-red-400 to-red-600" },
    { label: "Adaptif", value: latestResult.adaptif, color: "from-amber-400 to-amber-600" },
    { label: "Kolaboratif", value: latestResult.kolaboratif, color: "from-teal-400 to-teal-600" },
  ] : [];

  const hasPending = (karyawan?.assessmentsReceived?.length || 0) > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#16a34a] via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-green-600/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Selamat Datang, {karyawan?.nama || session.user.username}
              </h1>
              <p className="text-green-100 text-sm mt-0.5">
                {karyawan?.jabatan} · {karyawan?.divisi}
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-green-100 text-xs">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats + Result Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status */}
        <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 text-sm">Status Penilaian</h3>
              {hasPending ? (
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
              ) : (
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
              )}
            </div>

            {hasPending ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{karyawan?.assessmentsReceived?.length}</p>
                    <p className="text-xs text-gray-500">Penilaian Pending</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">Ada penilaian yang belum Anda isi</p>
                <Button asChild className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white h-10 rounded-xl">
                  <Link href="/dashboard/karyawan/penilaian">
                    Lihat & Isi Penilaian
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
                <p className="font-semibold text-gray-800">Semua Penilaian Selesai!</p>
                <p className="text-xs text-gray-500 mt-1">Terima kasih telah melengkapi penilaian</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Result */}
        <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 text-sm">Nilai AKHLAK Terakhir</h3>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>

            {latestResult ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-3xl font-bold text-[#16a34a]">
                    {latestResult.nilaiAkhir.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 self-end pb-1">/ 5.00</p>
                </div>

                {/* AKHLAK Mini bars */}
                <div className="space-y-2">
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
              <div className="text-center py-4">
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

      {/* AKHLAK Info */}
      <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Tentang Penilaian AKHLAK
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { letter: "A", name: "Amanah", color: "bg-blue-50 border-blue-200", textColor: "text-blue-700" },
              { letter: "K", name: "Kompeten", color: "bg-purple-50 border-purple-200", textColor: "text-purple-700" },
              { letter: "H", name: "Harmonis", color: "bg-green-50 border-green-200", textColor: "text-green-700" },
              { letter: "L", name: "Loyal", color: "bg-red-50 border-red-200", textColor: "text-red-700" },
              { letter: "A", name: "Adaptif", color: "bg-amber-50 border-amber-200", textColor: "text-amber-700" },
              { letter: "K", name: "Kolaboratif", color: "bg-teal-50 border-teal-200", textColor: "text-teal-700" },
            ].map((akhlak) => (
              <div key={akhlak.name} className={`p-3 rounded-xl border ${akhlak.color} text-center`}>
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <span className="text-sm font-bold text-gray-700">{akhlak.letter}</span>
                </div>
                <p className={`text-xs font-medium ${akhlak.textColor}`}>{akhlak.name}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Setiap indikator dinilai dengan skala 1–5. Nilai akhir merupakan rata-rata dari semua penilaian 360°.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
