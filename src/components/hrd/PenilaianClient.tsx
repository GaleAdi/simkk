"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ClipboardList, Search, Pencil, Trash2, Eye, CheckCircle, Clock } from "lucide-react";

interface Assessment {
  id: string;
  targetNama: string;
  targetJabatan: string;
  targetDivisi: string;
  penilaiUsername: string;
  jenis: string;
  status: string;
  createdAt: string;
}

interface KaryawanUser {
  userId: string;
  username: string;
  id: string;
  nama: string;
  jabatan: string;
  divisi: string;
}

interface Props {
  initialAssessments: Assessment[];
  karyawanList: KaryawanUser[];
}

const jenisOptions = [
  { value: "SELF", label: "Self Assessment", color: "bg-blue-100 text-blue-700" },
  { value: "ATASAN", label: "Atasan", color: "bg-purple-100 text-purple-700" },
  { value: "REKAN_KERJA", label: "Rekan Kerja", color: "bg-teal-100 text-teal-700" },
  { value: "BAWAHAN", label: "Bawahan", color: "bg-amber-100 text-amber-700" },
];

export function PenilaianClient({ initialAssessments, karyawanList }: Props) {
  const router = useRouter();
  const [assessments, setAssessments] = useState(initialAssessments);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ targetId: "", jenis: "SELF" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = assessments.filter((a) => {
    const matchesStatus = filterStatus === "ALL" || a.status === filterStatus;
    const matchesSearch = search === "" ||
      a.targetNama.toLowerCase().includes(search.toLowerCase()) ||
      a.penilaiUsername.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: assessments.length,
    pending: assessments.filter((a) => a.status === "PENDING").length,
    completed: assessments.filter((a) => a.status === "COMPLETED").length,
  };

  const handleSubmit = async () => {
    if (!form.targetId || !form.jenis) {
      setError("Pilih karyawan dan jenis penilaian");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat penilaian");

      const target = karyawanList.find((k) => k.userId === form.targetId);

      setAssessments([
        {
          id: json.id,
          targetNama: target?.nama || "-",
          targetJabatan: target?.jabatan || "-",
          targetDivisi: target?.divisi || "-",
          penilaiUsername: "Anda",
          jenis: form.jenis,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
        ...assessments,
      ]);
      setShowForm(false);
      setForm({ targetId: "", jenis: "SELF" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/assessment/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus");
      }
      setAssessments((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const getJenisConfig = (jenis: string) =>
    jenisOptions.find((j) => j.value === jenis) || { label: jenis, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header + Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penilaian Kinerja</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola dan pantau penilaian kinerja karyawan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg shadow-green-600/20 btn-press"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Buat Penilaian
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Penilaian", value: stats.total, icon: ClipboardList, valueColor: "text-gray-900", bg: "bg-gray-50 border-gray-200" },
          { label: "Pending", value: stats.pending, icon: Clock, valueColor: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
          { label: "Selesai", value: stats.completed, icon: CheckCircle, valueColor: "text-green-600", bg: "bg-green-50 border-green-200" },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.bg}`}>
            <div className="flex items-center gap-3">
              <stat.icon className="w-6 h-6 text-gray-400" />
              <div>
                <p className={`text-2xl font-bold ${stat.valueColor}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-green-200 shadow-lg animate-scale-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-7 h-7 bg-[#16a34a] text-white rounded-lg flex items-center justify-center text-sm font-bold">+</span>
                Buat Penilaian Baru
              </CardTitle>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Karyawan yang Dinilai</label>
                <select
                  className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  value={form.targetId}
                  onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                >
                  <option value="">— Pilih Karyawan —</option>
                  {karyawanList.map((k) => (
                    <option key={k.userId} value={k.userId}>
                      {k.nama} · {k.jabatan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Jenis Penilaian</label>
                <select
                  className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  value={form.jenis}
                  onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                >
                  {jenisOptions.map((j) => (
                    <option key={j.value} value={j.value}>{j.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Penilai info */}
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="w-7 h-7 bg-[#16a34a] rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Anda sebagai Penilai</p>
                <p className="text-xs text-gray-500">Penilai otomatis terisi dengan akun Anda</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                className="bg-[#16a34a] hover:bg-[#15803d] text-white btn-press"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Membuat..." : "Buat Penilaian"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Card */}
      <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
        {/* Table header bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap bg-white">
          <h3 className="font-semibold text-gray-900">Daftar Penilaian</h3>
          <div className="flex items-center gap-2">
            {/* Status filter */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {[
                { key: "ALL", label: `Semua (${stats.total})` },
                { key: "PENDING", label: `Pending (${stats.pending})` },
                { key: "COMPLETED", label: `Selesai (${stats.completed})` },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filterStatus === f.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari karyawan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48"
              />
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-medium text-gray-700 mb-1">Belum ada penilaian</p>
              <p className="text-sm text-gray-400 max-w-xs">
                {search ? "Tidak ada hasil untuk pencarian ini" : "Mulai buat penilaian baru dengan klik tombol di atas"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    {["Karyawan Dinilai", "Penilai", "Jenis", "Status", "Tanggal", "Aksi"].map((h) => (
                      <th key={h} className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((a) => {
                    const jenis = getJenisConfig(a.jenis);
                    return (
                      <tr key={a.id} className="hover:bg-gray-50/60 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{a.targetNama}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {a.targetJabatan} · {a.targetDivisi}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {a.penilaiUsername[0].toUpperCase()}
                            </div>
                            <span className="text-gray-700">{a.penilaiUsername}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${jenis.color}`}>
                            {jenis.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {a.status === "COMPLETED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              Selesai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {new Date(a.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <a
                              href={`/dashboard/hrd/penilaian/${a.id}`}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                a.status === "PENDING"
                                  ? "bg-[#16a34a]/10 text-[#16a34a] hover:bg-[#16a34a]/20"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                              title={a.status === "PENDING" ? "Isi Nilai" : "Lihat Detail"}
                            >
                              {a.status === "PENDING" ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </a>
                            <button
                              onClick={() => setDeleteId(a.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          Menampilkan {filtered.length} dari {assessments.length} penilaian
          {filterStatus !== "ALL" || search ? " (terfilter)" : ""}
        </p>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              Hapus Penilaian?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              Penilaian yang dihapus tidak dapat dikembalikan. Semua data penilaian termasuk nilai dan catatan akan hilang permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
