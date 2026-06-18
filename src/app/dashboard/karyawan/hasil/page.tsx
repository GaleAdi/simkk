"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AKHLAKRadarChart, convertToRadarData } from "@/components/charts/AKHLAKRadarChart";
import { TrendingUp, RefreshCw, Award } from "lucide-react";

interface AssessmentResult {
  id: string;
  karyawanId: string;
  amanah: number;
  kompeten: number;
  harmonis: number;
  loyal: number;
  adaptif: number;
  kolaboratif: number;
  nilaiAkhir: number;
  calculatedAt: string;
  karyawan: {
    id: string;
    nama: string;
    jabatan: string;
    divisi: string;
  };
}

interface DetailedResult {
  result: AssessmentResult;
  breakdown: {
    jenis: string;
    count: number;
    scores: Record<string, number>;
  }[];
  totalAssessments: number;
}

const jenisLabels: Record<string, string> = {
  SELF: "Self Assessment",
  ATASAN: "Penilaian Atasan",
  REKAN_KERJA: "Penilaian Rekan Kerja",
  BAWAHAN: "Penilaian Bawahan",
};

const akhlakMeta = [
  { key: "amanah", label: "A", color: "from-blue-400 to-blue-600", name: "Amanah", desc: "Memiliki integritas dan tanggung jawab" },
  { key: "kompeten", label: "K", color: "from-purple-400 to-purple-600", name: "Kompeten", desc: "Meningkatkan kompetensi diri" },
  { key: "harmonis", label: "H", color: "from-green-400 to-green-600", name: "Harmonis", desc: "Saling menghormati perbedaan" },
  { key: "loyal", label: "L", color: "from-red-400 to-red-600", name: "Loyal", desc: "Patuh pada kepercayaan" },
  { key: "adaptif", label: "A", color: "from-amber-400 to-amber-600", name: "Adaptif", desc: "Berkontribusi dalam perubahan" },
  { key: "kolaboratif", label: "K", color: "from-teal-400 to-teal-600", name: "Kolaboratif", desc: "Membangun kerja sama sinergis" },
];

function getNilaiColor(value: number): string {
  if (value === 0) return "text-gray-400";
  if (value < 3) return "text-red-500";
  if (value < 4) return "text-amber-500";
  return "text-green-500";
}

function getAkhlakBarColor(value: number): string {
  if (value === 0) return "bg-gray-300";
  if (value < 3) return "bg-red-500";
  if (value < 4) return "bg-amber-500";
  return "bg-green-500";
}

function getNilaiBadgeClass(value: number): string {
  if (value === 0) return "bg-gray-100 text-gray-600";
  if (value < 3) return "bg-red-100 text-red-700";
  if (value < 4) return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

export default function HasilKaryawanPage() {
  const [result, setResult] = useState<DetailedResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOwnResult = async () => {
    setIsLoading(true);
    try {
      const listResponse = await fetch("/api/hasil");
      if (listResponse.ok) {
        const results = await listResponse.json();
        if (results.length > 0) {
          const detailResponse = await fetch(`/api/hasil/${results[0].karyawan.id}`);
          if (detailResponse.ok) {
            const data = await detailResponse.json();
            setResult(data);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching result:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnResult();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-[#16a34a] via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-green-600/20">
          <h1 className="text-xl font-bold text-white">Hasil Penilaian Saya</h1>
          <p className="text-green-100 text-sm mt-0.5">Lihat hasil penilaian kinerja Anda</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-[#16a34a] via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-green-600/20">
          <h1 className="text-xl font-bold text-white">Hasil Penilaian Saya</h1>
          <p className="text-green-100 text-sm mt-0.5">Lihat hasil penilaian kinerja Anda</p>
        </div>
        <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-5">
              <Award className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Belum Ada Hasil Penilaian</h2>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Hasil penilaian Anda akan muncul setelah Anda menyelesaikan penilaian terhadap rekan kerja dan atasan menyelesaikan penilaian terhadap Anda.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const radarData = convertToRadarData(result.result);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#16a34a] via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-green-600/20">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Hasil Penilaian Saya</h1>
            <p className="text-green-100 text-sm mt-0.5">
              Berdasarkan {result.totalAssessments} penilaian dari berbagai pihak
            </p>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
        <CardContent className="pt-8 pb-8 text-center">
          <p className="text-sm text-gray-500 font-medium mb-2">Nilai Akhir Anda</p>
          <div className="inline-flex items-baseline">
            <span className={`text-7xl font-bold ${getNilaiColor(result.result.nilaiAkhir)}`}>
              {result.result.nilaiAkhir.toFixed(2)}
            </span>
            <span className="text-2xl text-gray-300 ml-2">/ 5.00</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Badge className={`${getNilaiBadgeClass(result.result.nilaiAkhir)} px-4 py-1.5 text-sm font-semibold`}>
              {result.result.nilaiAkhir >= 4 ? "Baik" : result.result.nilaiAkhir >= 3 ? "Cukup" : "Perlu Perbaikan"}
            </Badge>
            <span className="text-xs text-gray-400">{result.totalAssessments} penilaian masuk</span>
          </div>
        </CardContent>
      </Card>

      {/* AKHLAK Detail Bars */}
      <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            Detail Skor Per Indikator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {akhlakMeta.map((a) => {
            const value = result.result[a.key as keyof typeof result.result] as number;
            return (
              <div key={a.key} className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="text-white text-xs font-bold">{a.label}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className={`text-xl font-bold ${getNilaiColor(value)}`}>{value.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getAkhlakBarColor(value)}`}
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Grafik AKHLAK</CardTitle>
        </CardHeader>
        <CardContent>
          <AKHLAKRadarChart data={radarData} title="Skor AKHLAK Anda" />
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {akhlakMeta.map((a) => (
              <div key={a.key} className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${a.color} bg-opacity-10 flex items-center gap-1.5`}>
                <div className={`w-4 h-4 rounded bg-gradient-to-br ${a.color}`} />
                <span className="text-xs font-medium text-gray-600">{a.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breakdown by Jenis */}
      {result.breakdown.length > 0 && (
        <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Skor Berdasarkan Jenis Penilaian</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="text-xs">Jenis Penilaian</TableHead>
                    <TableHead className="text-center text-xs">Jumlah</TableHead>
                    {akhlakMeta.map((a) => (
                      <TableHead key={a.key} className="text-center text-xs">{a.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.breakdown.map((b) => (
                    <TableRow key={b.jenis}>
                      <TableCell className="text-sm font-medium">{jenisLabels[b.jenis] || b.jenis}</TableCell>
                      <TableCell className="text-center text-sm">{b.count}</TableCell>
                      {akhlakMeta.map((a) => (
                        <TableCell key={a.key} className="text-center text-sm">
                          <span className={getNilaiColor(b.scores[a.key.toUpperCase()] || 0)}>
                            {(b.scores[a.key.toUpperCase()] || 0).toFixed(1)}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-blue-800 text-sm">Tentang Penilaian AKHLAK</p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            Penilaian ini menggunakan metode 360° di mana Anda dinilai oleh berbagai pihak: atasan, rekan kerja, dan bawahan. Nilai akhir merupakan rata-rata dari semua penilaian yang diterima.
          </p>
        </div>
      </div>
    </div>
  );
}
