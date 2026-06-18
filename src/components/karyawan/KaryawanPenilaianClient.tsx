"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Plus, Search, Pencil, Eye, CheckCircle, Clock } from "lucide-react";

interface Assessment {
  id: string;
  targetNama: string;
  targetJabatan: string;
  targetDivisi: string;
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

const jenisOptions = [
  { value: "SELF", label: "Self Assessment", color: "bg-blue-100 text-blue-700" },
  { value: "ATASAN", label: "Atasan", color: "bg-purple-100 text-purple-700" },
  { value: "REKAN_KERJA", label: "Rekan Kerja", color: "bg-teal-100 text-teal-700" },
  { value: "BAWAHAN", label: "Bawahan", color: "bg-amber-100 text-amber-700" },
];

export function KaryawanPenilaianClient({
  initialAssessments,
  karyawanList,
}: {
  initialAssessments: Assessment[];
  karyawanList: KaryawanUser[];
}) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ targetId: "", jenis: "SELF" });

  const stats = {
    total: initialAssessments.length,
    pending: initialAssessments.filter((a) => a.status === "PENDING").length,
    completed: initialAssessments.filter((a) => a.status === "COMPLETED").length,
  };

  const filtered = initialAssessments.filter((a) => {
    const matchesStatus = filter === "ALL" || a.status === filter;
    const matchesSearch = search === "" ||
      a.targetNama.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
      if (!res.ok) throw new Error(json.error || "Gagal membuat");
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getJenisConfig = (jenis: string) =>
    jenisOptions.find((j) => j.value === jenis) || { label: jenis, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penilaian Kinerja</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Lengkapi dan kelola penilaian kinerja sebagai penilai
          </p>
        </div>
        <Button
          className="bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg shadow-green-600/20 btn-press"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Buat Penilaian
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Ditugaskan", value: stats.total, icon: ClipboardList, valueColor: "text-gray-900", bg: "bg-gray-50 border-gray-200" },
          { label: "Belum Diisi", value: stats.pending, icon: Clock, valueColor: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
          { label: "Sudah Diisi", value: stats.completed, icon: CheckCircle, valueColor: "text-green-600", bg: "bg-green-50 border-green-200" },
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

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-[#16a34a] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-green-800 text-sm">Tentang Penilaian 360°</p>
          <p className="text-xs text-green-600 mt-0.5">
            Nilai 6 indikator AKHLAK (Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif) untuk karyawan di lingkungan kerja Anda.
          </p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-green-200 shadow-lg animate-scale-in">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="w-7 h-7 bg-[#16a34a] rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Anda sebagai Penilai</p>
                <p className="text-xs text-gray-500">Penilai otomatis terisi dengan akun Anda</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Karyawan yang Dinilai</label>
                <select
                  className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
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
                  className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  value={form.jenis}
                  onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                >
                  {jenisOptions.map((j) => (
                    <option key={j.value} value={j.value}>{j.label}</option>
                  ))}
                </select>
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

      {/* Table */}
      <Card className="border-0 shadow-lg shadow-gray-100/80 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap bg-white">
          <h3 className="font-semibold text-gray-900">Daftar Penilaian</h3>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {[
                { key: "ALL", label: `Semua (${stats.total})` },
                { key: "PENDING", label: `Pending (${stats.pending})` },
                { key: "COMPLETED", label: `Selesai (${stats.completed})` },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filter === f.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-40"
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
              <p className="font-medium text-gray-700 mb-1">Tidak ada penilaian</p>
              <p className="text-sm text-gray-400 max-w-xs">
                {search ? "Tidak ada hasil" : "Belum ada penilaian yang ditugaskan"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    {["Karyawan Dinilai", "Jenis", "Status", "Tanggal", "Aksi"].map((h) => (
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
                      <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{a.targetNama}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {a.targetJabatan} · {a.targetDivisi}
                            </p>
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
                          <a
                            href={`/dashboard/karyawan/penilaian/${a.id}`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              a.status === "PENDING"
                                ? "bg-[#16a34a] text-white hover:bg-[#15803d]"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {a.status === "PENDING" ? (
                              <><Pencil className="w-3.5 h-3.5" /> Isi Sekarang</>
                            ) : (
                              <><Eye className="w-3.5 h-3.5" /> Lihat Detail</>
                            )}
                          </a>
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
    </div>
  );
}
