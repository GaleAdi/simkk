import { prisma } from "@/lib/prisma";
import { KaryawanTable } from "@/components/hrd/KaryawanTable";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, Calendar } from "lucide-react";

export default async function KaryawanPage() {
  const karyawans = await prisma.karyawan.findMany({
    include: {
      user: {
        select: {
          username: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalDivisi = new Set(karyawans.map((k) => k.divisi)).size;
  const now = new Date();
  const bulanIni = karyawans.filter((k) => {
    const created = new Date(k.createdAt);
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#16a34a] via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-green-600/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Manajemen Karyawan</h1>
            <p className="text-green-100 text-sm mt-0.5">
              Kelola data karyawan PT Energi Nusantara
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-green-100 text-xs">
              {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Total Karyawan", value: karyawans.length, icon: Users, bg: "bg-blue-50 border-blue-200", iconBg: "bg-blue-500", iconColor: "text-white" },
          { title: "Jumlah Divisi", value: totalDivisi, icon: Building2, bg: "bg-purple-50 border-purple-200", iconBg: "bg-purple-500", iconColor: "text-white" },
          { title: "Baru Bulan Ini", value: bulanIni, icon: Calendar, bg: "bg-amber-50 border-amber-200", iconBg: "bg-amber-500", iconColor: "text-white" },
        ].map((stat, i) => (
          <Card key={i} className={`border ${stat.bg} rounded-2xl overflow-hidden`}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <KaryawanTable />
        </CardContent>
      </Card>
    </div>
  );
}
