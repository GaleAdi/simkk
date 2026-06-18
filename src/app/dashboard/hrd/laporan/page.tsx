"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Search, RefreshCw, BarChart3, Users, TrendingUp } from "lucide-react";
import { generateLaporanPDF, generateSingleEmployeePDF } from "@/lib/generatePDF";

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

function getNilaiBadgeClass(value: number): string {
  if (value === 0) return "bg-gray-100 text-gray-600";
  if (value < 3) return "bg-red-100 text-red-700";
  if (value < 4) return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

function getScoreColor(value: number): string {
  if (value === 0) return "text-gray-400";
  if (value < 3) return "text-red-500";
  if (value < 4) return "text-amber-500";
  return "text-green-500";
}

const akhlakMeta = [
  { key: "amanah", label: "A" },
  { key: "kompeten", label: "K" },
  { key: "harmonis", label: "H" },
  { key: "loyal", label: "L" },
  { key: "adaptif", label: "A" },
  { key: "kolaboratif", label: "K" },
];

const divisiOptions = [
  "Keuangan", "Pemasaran", "Operasi", "HRD", "IT", "Produksi", "Logistik", "Umum",
];

export default function LaporanPage() {
  const { toast } = useToast();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<AssessmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [divisiFilter, setDivisiFilter] = useState<string>("all");
  const [minNilaiFilter, setMinNilaiFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [results, divisiFilter, minNilaiFilter, searchQuery]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/hasil");
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch {
      toast({ title: "Error", description: "Gagal mengambil data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...results];
    if (divisiFilter !== "all") {
      filtered = filtered.filter((r) => r.karyawan.divisi === divisiFilter);
    }
    if (minNilaiFilter !== "all") {
      filtered = filtered.filter((r) => r.nilaiAkhir >= parseFloat(minNilaiFilter));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.karyawan.nama.toLowerCase().includes(q) ||
          r.karyawan.divisi.toLowerCase().includes(q) ||
          r.karyawan.jabatan.toLowerCase().includes(q)
      );
    }
    setFilteredResults(filtered);
  };

  const exportAllPDF = async () => {
    if (filteredResults.length === 0) {
      toast({ title: "Tidak ada data", description: "Tidak ada data untuk di-export", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      generateLaporanPDF(filteredResults);
      toast({ title: "Berhasil", description: `Laporan ${filteredResults.length} karyawan berhasil di-export` });
    } catch {
      toast({ title: "Error", description: "Gagal mengexport PDF", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const exportSinglePDF = async (karyawanId: string, nama: string) => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/hasil/${karyawanId}`);
      if (response.ok) {
        const data: DetailedResult = await response.json();
        generateSingleEmployeePDF(data);
        toast({ title: "Berhasil", description: `Laporan ${nama} berhasil di-export` });
      }
    } catch {
      toast({ title: "Error", description: "Gagal mengexport PDF", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const avgNilai = filteredResults.length > 0
    ? filteredResults.reduce((s, r) => s + r.nilaiAkhir, 0) / filteredResults.length
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#16a34a] via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-green-600/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Laporan & Export</h1>
            <p className="text-green-100 text-sm mt-0.5">
              Export laporan penilaian kinerja karyawan ke PDF
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Total Karyawan", value: results.length, icon: Users, bg: "bg-blue-50 border-blue-200", iconBg: "bg-blue-500", iconColor: "text-white" },
          { title: "Hasil Terfilter", value: filteredResults.length, icon: BarChart3, bg: "bg-green-50 border-green-200", iconBg: "bg-green-500", iconColor: "text-white" },
          { title: "Rata-rata Nilai", value: avgNilai.toFixed(2) || "0.00", icon: TrendingUp, bg: "bg-purple-50 border-purple-200", iconBg: "bg-purple-500", iconColor: "text-white", suffix: "/5" },
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
        {/* Table Header Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap bg-white">
          <h3 className="font-semibold text-gray-900">Daftar Karyawan</h3>
          <Button
            onClick={exportAllPDF}
            disabled={isExporting || filteredResults.length === 0}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg shadow-green-600/20 btn-press"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isExporting ? "Mengexport..." : "Export Semua ke PDF"}
          </Button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama, divisi, atau jabatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-white border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              />
            </div>
            <Select value={divisiFilter} onValueChange={setDivisiFilter}>
              <SelectTrigger className="h-9 w-full sm:w-44 bg-white border-gray-200 rounded-lg text-sm">
                <SelectValue placeholder="Filter Divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divisiOptions.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={minNilaiFilter} onValueChange={setMinNilaiFilter}>
              <SelectTrigger className="h-9 w-full sm:w-44 bg-white border-gray-200 rounded-lg text-sm">
                <SelectValue placeholder="Filter Nilai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Nilai</SelectItem>
                <SelectItem value="4">≥ 4.00 (Baik)</SelectItem>
                <SelectItem value="3">≥ 3.00 (Cukup)</SelectItem>
                <SelectItem value="2">≥ 2.00 (Kurang)</SelectItem>
              </SelectContent>
            </Select>
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
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-medium text-gray-700 mb-1">
                {results.length === 0 ? "Belum ada data hasil penilaian" : "Tidak ada data yang cocok"}
              </p>
              <p className="text-sm text-gray-400 max-w-xs">
                {results.length === 0 ? "Selesaikan penilaian terlebih dahulu" : "Coba ubah filter pencarian"}
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
                    <th className="text-center px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nilai</th>
                    <th className="text-center px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredResults.map((result, index) => (
                    <tr key={result.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 text-gray-400 text-xs">{index + 1}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{result.karyawan.nama}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{result.karyawan.jabatan} · {result.karyawan.divisi}</p>
                      </td>
                      {akhlakMeta.map((a) => {
                        const val = result[a.key as keyof typeof result] as number;
                        return (
                          <td key={a.key} className="px-2 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getScoreColor(val).replace("text-", "bg-").replace("500", "50").replace("400", "50")} ${getScoreColor(val)}`}>
                              {val.toFixed(1)}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-bold ${getScoreColor(result.nilaiAkhir)}`}>
                          {result.nilaiAkhir.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => exportSinglePDF(result.karyawan.id, result.karyawan.nama)}
                          disabled={isExporting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#16a34a]/10 text-[#16a34a] hover:bg-[#16a34a]/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
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

      {filteredResults.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          Menampilkan {filteredResults.length} dari {results.length} karyawan
          {(divisiFilter !== "all" || minNilaiFilter !== "all" || searchQuery) && " (terfilter)"}
          {" · "} A=Amanah · K=Kompeten · H=Harmonis · L=Loyal · A=Adaptif · K=Kolaboratif
        </p>
      )}
    </div>
  );
}
