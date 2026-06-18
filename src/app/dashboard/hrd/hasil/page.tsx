"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, RefreshCw, TrendingUp, Users, Award, AlertTriangle } from "lucide-react";

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
  SELF: "Self",
  ATASAN: "Atasan",
  REKAN_KERJA: "Rekan",
  BAWAHAN: "Bawahan",
};

function getScoreColor(value: number): string {
  if (value === 0) return "bg-gray-50 text-gray-400";
  if (value < 3) return "bg-red-50 text-red-600";
  if (value < 4) return "bg-amber-50 text-amber-600";
  return "bg-green-50 text-green-600";
}

function getNilaiBadgeClass(value: number): string {
  if (value === 0) return "bg-gray-100 text-gray-600";
  if (value < 3) return "bg-red-100 text-red-700";
  if (value < 4) return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

function getNilaiAkhirColor(value: number): string {
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

const akhlakMeta = [
  { key: "amanah", label: "A", color: "from-blue-400 to-blue-600" },
  { key: "kompeten", label: "K", color: "from-purple-400 to-purple-600" },
  { key: "harmonis", label: "H", color: "from-green-400 to-green-600" },
  { key: "loyal", label: "L", color: "from-red-400 to-red-600" },
  { key: "adaptif", label: "A", color: "from-amber-400 to-amber-600" },
  { key: "kolaboratif", label: "K", color: "from-teal-400 to-teal-600" },
];

export default function HasilPage() {
  const { toast } = useToast();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<AssessmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<DetailedResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredResults(results);
    } else {
      const q = search.toLowerCase();
      setFilteredResults(
        results.filter(
          (r) =>
            r.karyawan.nama.toLowerCase().includes(q) ||
            r.karyawan.divisi.toLowerCase().includes(q) ||
            r.karyawan.jabatan.toLowerCase().includes(q)
        )
      );
    }
  }, [results, search]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/hasil");
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setFilteredResults(data);
      }
    } catch {
      toast({ title: "Error", description: "Gagal mengambil data hasil penilaian", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openDetail = async (karyawanId: string) => {
    setIsDetailLoading(true);
    setIsModalOpen(true);
    try {
      const response = await fetch(`/api/hasil/${karyawanId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedResult(data);
      }
    } catch {
      toast({ title: "Error", description: "Gagal mengambil detail hasil", variant: "destructive" });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const avgNilai = results.length > 0 ? results.reduce((s, r) => s + r.nilaiAkhir, 0) / results.length : 0;
  const diBawah = results.filter((r) => r.nilaiAkhir > 0 && r.nilaiAkhir < 3).length;
  const diAtas = results.filter((r) => r.nilaiAkhir >= 4).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#16a34a] via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-green-600/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Hasil Penilaian</h1>
            <p className="text-green-100 text-sm mt-0.5">
              Pantau dan kelola hasil penilaian kinerja karyawan
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={fetchResults}
            disabled={isLoading}
            className="text-white hover:bg-white/20 h-9"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Dinilai", value: results.length, icon: Users, bg: "bg-blue-50 border-blue-200", iconBg: "bg-blue-500", iconColor: "text-white" },
          { title: "Rata-rata Nilai", value: avgNilai.toFixed(2) || "0.00", icon: TrendingUp, bg: "bg-green-50 border-green-200", iconBg: "bg-green-500", iconColor: "text-white", suffix: "/5" },
          { title: "Di Bawah Standar", value: diBawah, icon: AlertTriangle, bg: "bg-red-50 border-red-200", iconBg: "bg-red-500", iconColor: "text-white" },
          { title: "Di Atas Standar", value: diAtas, icon: Award, bg: "bg-purple-50 border-purple-200", iconBg: "bg-purple-500", iconColor: "text-white" },
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

      {/* Table */}
      <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap bg-white">
          <h3 className="font-semibold text-gray-900">Daftar Hasil Penilaian</h3>
          <div className="relative">
            <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari karyawan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48"
            />
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw className="w-6 h-6 text-gray-300 animate-spin mb-3" />
              <p className="text-sm text-gray-400">Memuat data...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-medium text-gray-700 mb-1">
                {search ? "Tidak ada hasil" : "Belum ada data hasil penilaian"}
              </p>
              <p className="text-sm text-gray-400 max-w-xs">
                {search ? "Coba kata kunci lain" : "Hasil penilaian akan muncul setelah penilaian selesai"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider w-10">No</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Karyawan</th>
                    {akhlakMeta.map((a) => (
                      <th key={a.key} className="text-center px-2 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider w-12">{a.label}</th>
                    ))}
                    <th className="text-center px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nilai Akhir</th>
                    <th className="text-center px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredResults.map((result, index) => (
                    <tr
                      key={result.id}
                      className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                      onClick={() => openDetail(result.karyawan.id)}
                    >
                      <td className="px-6 py-4 text-gray-400 text-xs">{index + 1}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{result.karyawan.nama}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{result.karyawan.jabatan} · {result.karyawan.divisi}</p>
                      </td>
                      {akhlakMeta.map((a) => {
                        const val = result[a.key as keyof typeof result] as number;
                        return (
                          <td key={a.key} className="px-2 py-4 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getScoreColor(val)}`}>
                              {val.toFixed(1)}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-bold ${getNilaiAkhirColor(result.nilaiAkhir)}`}>
                          {result.nilaiAkhir.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          className="px-3 py-1.5 bg-[#16a34a]/10 text-[#16a34a] hover:bg-[#16a34a]/20 rounded-lg text-xs font-medium transition-colors"
                          onClick={(e) => { e.stopPropagation(); openDetail(result.karyawan.id); }}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      {filteredResults.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          A=Amanah · K=Kompeten · H=Harmonis · L=Loyal · A=Adaptif · K=Kolaboratif
        </p>
      )}

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#16a34a]" />
              Detail Hasil Penilaian
            </DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : selectedResult ? (
            <div className="space-y-5">
              {/* Employee Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#16a34a] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {selectedResult.result.karyawan.nama.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedResult.result.karyawan.nama}</p>
                    <p className="text-sm text-gray-500">{selectedResult.result.karyawan.jabatan} · {selectedResult.result.karyawan.divisi}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-400">Total Penilaian</p>
                    <p className="text-lg font-bold text-[#16a34a]">{selectedResult.totalAssessments}</p>
                  </div>
                </div>
              </div>

              {/* Nilai Akhir */}
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <p className="text-sm text-gray-500 mb-2">Nilai Akhir</p>
                <p className={`text-5xl font-bold ${getNilaiAkhirColor(selectedResult.result.nilaiAkhir)}`}>
                  {selectedResult.result.nilaiAkhir.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400 mt-1">dari 5.00</p>
                <span className={`inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-semibold ${getNilaiBadgeClass(selectedResult.result.nilaiAkhir)}`}>
                  {selectedResult.result.nilaiAkhir >= 4 ? "Baik" : selectedResult.result.nilaiAkhir >= 3 ? "Cukup" : "Perlu Perbaikan"}
                </span>
              </div>

              {/* AKHLAK Bars */}
              <div className="space-y-3">
                {akhlakMeta.map((a) => {
                  const val = selectedResult.result[a.key as keyof typeof selectedResult.result] as number;
                  return (
                    <div key={a.key} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{a.label}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-gray-700 capitalize">{a.key}</p>
                          <p className={`text-sm font-bold ${getNilaiAkhirColor(val)}`}>{val.toFixed(2)}</p>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getAkhlakBarColor(val)}`}
                            style={{ width: `${(val / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Breakdown */}
              {selectedResult.breakdown.length > 0 && (
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rincian Per Jenis Penilaian</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="text-xs">Jenis</TableHead>
                        <TableHead className="text-center text-xs">Jumlah</TableHead>
                        {akhlakMeta.map((a) => (
                          <TableHead key={a.key} className="text-center text-xs">{a.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedResult.breakdown.map((b) => (
                        <TableRow key={b.jenis}>
                          <TableCell className="text-sm font-medium">{jenisLabels[b.jenis] || b.jenis}</TableCell>
                          <TableCell className="text-center text-sm">{b.count}</TableCell>
                          {akhlakMeta.map((a) => (
                            <TableCell key={a.key} className="text-center text-xs">
                              {(b.scores[a.key.toUpperCase()] || 0).toFixed(1)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
