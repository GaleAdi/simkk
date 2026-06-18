import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, CheckCircle, Clock, TrendingUp, ArrowRight, ClipboardList, BarChart3 } from "lucide-react";

export default async function HRDDashboardPage() {
  const session = await getServerSession(authOptions);

  const [
    totalKaryawan,
    totalPenilaian,
    penilaianSelesai,
    penilaianPending,
    rataRataNilai,
    recentAssessments,
  ] = await Promise.all([
    prisma.karyawan.count(),
    prisma.assessment.count(),
    prisma.assessment.count({ where: { status: "COMPLETED" } }),
    prisma.assessment.count({ where: { status: "PENDING" } }),
    prisma.assessmentResult.aggregate({ _avg: { nilaiAkhir: true } }),
    prisma.assessment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        target: { select: { nama: true, jabatan: true } },
        penilai: { select: { username: true } },
      },
    }),
  ]);

  const completionRate = totalPenilaian > 0
    ? Math.round((penilaianSelesai / totalPenilaian) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#16a34a] via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-green-600/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              Dashboard HRD
            </h1>
            <p className="text-green-100 text-sm mt-0.5">
              Selamat datang, {session?.user.username} · PT Energi Nusantara
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-green-100 text-xs">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Karyawan",
            value: totalKaryawan,
            icon: Users,
            bg: "bg-blue-50 border-blue-200",
            iconBg: "bg-blue-500",
            iconColor: "text-white",
          },
          {
            title: "Penilaian Selesai",
            value: penilaianSelesai,
            icon: CheckCircle,
            bg: "bg-green-50 border-green-200",
            iconBg: "bg-green-500",
            iconColor: "text-white",
          },
          {
            title: "Pending",
            value: penilaianPending,
            icon: Clock,
            bg: "bg-amber-50 border-amber-200",
            iconBg: "bg-amber-500",
            iconColor: "text-white",
          },
          {
            title: "Rata-rata Nilai",
            value: rataRataNilai._avg.nilaiAkhir?.toFixed(2) || "0.00",
            icon: TrendingUp,
            bg: "bg-purple-50 border-purple-200",
            iconBg: "bg-purple-500",
            iconColor: "text-white",
            suffix: "/5",
          },
        ].map((stat, i) => (
          <Card key={i} className={`border ${stat.bg} rounded-2xl overflow-hidden`}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                    {stat.suffix && <span className="text-sm font-normal text-gray-400">{stat.suffix}</span>}
                  </p>
                </div>
                <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Second Row: Quick Actions + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                href: "/dashboard/hrd/penilaian", label: "Buat Penilaian", icon: ClipboardList,
                iconBg: "bg-green-50 text-green-600",
              },
              {
                href: "/dashboard/hrd/karyawan", label: "Tambah Karyawan", icon: Users,
                iconBg: "bg-blue-50 text-blue-600",
              },
              {
                href: "/dashboard/hrd/hasil", label: "Lihat Hasil", icon: BarChart3,
                iconBg: "bg-purple-50 text-purple-600",
              },
            ].map((action) => (
              <Button key={action.href} asChild variant="outline" className="w-full justify-start h-12 rounded-xl border-gray-200 hover:bg-gray-50">
                <Link href={action.href}>
                  <div className={`w-8 h-8 rounded-lg ${action.iconBg} flex items-center justify-center mr-3`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  {action.label}
                  <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 text-sm">Tingkat Penyelesaian</h3>
              <span className="text-2xl font-bold text-[#16a34a]">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              {penilaianSelesai} dari {totalPenilaian} penilaian telah selesai
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAssessments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Belum ada aktivitas</p>
            ) : (
              <div className="space-y-3">
                {recentAssessments.map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.status === "COMPLETED" ? "bg-green-500" : "bg-amber-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{a.target.nama}</p>
                      <p className="text-xs text-gray-400">
                        oleh {a.penilai.username} · {new Date(a.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${a.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {a.status === "COMPLETED" ? "Selesai" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
