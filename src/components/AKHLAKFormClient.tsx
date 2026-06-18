"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface Entry {
  indikator: string;
  nilai: number;
  catatan?: string;
}

interface Props {
  assessmentId: string;
  initialEntries: Entry[];
  isCompleted: boolean;
  backUrl: string;
}

const AKHLAK_CONFIG = [
  {
    key: "AMANAH",
    label: "Amanah",
    color: "blue",
    colorMap: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      header: "bg-blue-600",
      active: "bg-blue-600",
      selected: "border-blue-500 bg-blue-100",
    },
    description:
      "Memegang teguh kepercayaan yang diberikan, jujur, dan bertanggung jawab dalam setiap tugas.",
    indicators: [
      "Menepati komitmen dan tenggat waktu yang disepakati",
      "Bertanggung jawab atas pekerjaan yang menjadi tugasnya",
      "Jujur dalam menyampaikan informasi dan data",
      "Menjaga kerahasiaan informasi yang dipercayakan",
    ],
  },
  {
    key: "KOMPETEN",
    label: "Kompeten",
    color: "purple",
    colorMap: {
      border: "border-purple-200",
      bg: "bg-purple-50",
      header: "bg-purple-600",
      active: "bg-purple-600",
      selected: "border-purple-500 bg-purple-100",
    },
    description:
      "Memiliki kemampuan dan keahlian yang dibutuhkan untuk menjalankan tugas dengan baik.",
    indicators: [
      "Menguasai bidang keahlian sesuai jabatan dan tugas",
      "Terus belajar dan mengembangkan diri untuk meningkatkan skill",
      "Mampu menyelesaikan masalah dengan solusi yang tepat",
      "Menghasilkan pekerjaan yang berkualitas dan akurat",
    ],
  },
  {
    key: "HARMONIS",
    label: "Harmonis",
    color: "green",
    colorMap: {
      border: "border-green-200",
      bg: "bg-green-50",
      header: "bg-green-600",
      active: "bg-green-600",
      selected: "border-green-500 bg-green-100",
    },
    description:
      "Menjaga keselarasan dan keharmonisan dalam lingkungan kerja.",
    indicators: [
      "Menjaga hubungan baik dengan seluruh rekan kerja",
      "Menghargai perbedaan pendapat dan sudut pandang",
      "Berkontribusi menciptakan suasana kerja yang positif",
      "Tidak melakukan diskriminasi dalam bekerja",
    ],
  },
  {
    key: "LOYAL",
    label: "Loyal",
    color: "red",
    colorMap: {
      border: "border-red-200",
      bg: "bg-red-50",
      header: "bg-red-600",
      active: "bg-red-600",
      selected: "border-red-500 bg-red-100",
    },
    description:
      "Setia dan berdedikasi kepada organisasi serta visi dan misi perusahaan.",
    indicators: [
      "Mendukung kebijakan dan keputusan organisasi",
      "Menjaga reputasi dan nama baik perusahaan",
      "Berdedikasi tinggi dalam menyelesaikan tugas",
      "Setia terhadap organisasi tempat bernaung",
    ],
  },
  {
    key: "ADAPTIF",
    label: "Adaptif",
    color: "amber",
    colorMap: {
      border: "border-amber-200",
      bg: "bg-amber-50",
      header: "bg-amber-500",
      active: "bg-amber-500",
      selected: "border-amber-500 bg-amber-100",
    },
    description:
      "Mampu menyesuaikan diri dengan perubahan dan inovatif dalam bekerja.",
    indicators: [
      "Terbuka dan cepat menyesuaikan diri dengan perubahan",
      "Proaktif dalam menghadapi tantangan dan situasi baru",
      "Mendorong dan mendukung inovasi di tempat kerja",
      "Tidak mudah menyerah dalam situasi sulit",
    ],
  },
  {
    key: "KOLABORATIF",
    label: "Kolaboratif",
    color: "teal",
    colorMap: {
      border: "border-teal-200",
      bg: "bg-teal-50",
      header: "bg-teal-600",
      active: "bg-teal-600",
      selected: "border-teal-500 bg-teal-100",
    },
    description:
      "Bekerja sama dengan tim dan pihak lain untuk mencapai tujuan bersama.",
    indicators: [
      "Aktif berkontribusi dan bekerja sama dalam tim",
      "Bersedia membantu rekan kerja yang membutuhkan",
      "Berbagi pengetahuan dan pengalaman dengan tim",
      "Mencapai tujuan bersama dengan sinergi yang baik",
    ],
  },
];

const SCORE_CONFIG: Record<number, { label: string; desc: string; color: string; bg: string; text: string }> = {
  1: { label: "Sangat Kurang", desc: "Sangat di bawah ekspektasi", color: "bg-red-500", bg: "bg-red-50 hover:bg-red-100", text: "text-red-700" },
  2: { label: "Kurang", desc: "Di bawah ekspektasi", color: "bg-orange-500", bg: "bg-orange-50 hover:bg-orange-100", text: "text-orange-700" },
  3: { label: "Cukup", desc: "Sesuai ekspektasi dasar", color: "bg-amber-500", bg: "bg-amber-50 hover:bg-amber-100", text: "text-amber-700" },
  4: { label: "Baik", desc: "Melebihi ekspektasi", color: "bg-blue-500", bg: "bg-blue-50 hover:bg-blue-100", text: "text-blue-700" },
  5: { label: "Sangat Baik", desc: "Sangat melebihi ekspektasi", color: "bg-green-500", bg: "bg-green-50 hover:bg-green-100", text: "text-green-700" },
};

export function AKHLAKFormClient({
  assessmentId,
  initialEntries,
  isCompleted,
  backUrl,
}: Props) {
  const router = useRouter();

  // Build entries map: indikator -> { nilai, catatan }
  const [entries, setEntries] = useState<Record<string, { nilai: number; catatan: string }>>(() => {
    const map: Record<string, { nilai: number; catatan: string }> = {};
    for (const e of initialEntries) {
      map[e.indikator] = {
        nilai: e.nilai,
        catatan: e.catatan || "",
      };
    }
    return map;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const setNilai = (indikator: string, nilai: number) => {
    if (isCompleted) return;
    setEntries((prev) => ({
      ...prev,
      [indikator]: { ...prev[indikator], nilai },
    }));
  };

  const setCatatan = (indikator: string, catatan: string) => {
    if (isCompleted) return;
    setEntries((prev) => ({
      ...prev,
      [indikator]: { ...prev[indikator], catatan },
    }));
  };

  const filledCount = AKHLAK_CONFIG.filter((a) => entries[a.key]?.nilai > 0).length;
  const allFilled = filledCount === AKHLAK_CONFIG.length;

  const totalNilai =
    allFilled
      ? AKHLAK_CONFIG.reduce((sum, a) => sum + (entries[a.key]?.nilai || 0), 0) / AKHLAK_CONFIG.length
      : 0;

  const handleSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError("");

    try {
      const submitEntries = AKHLAK_CONFIG.map((a) => ({
        indikator: a.key,
        nilai: entries[a.key]?.nilai || 0,
        catatan: entries[a.key]?.catatan || "",
      }));

      const res = await fetch(`/api/assessment/${assessmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: submitEntries }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menyimpan penilaian");
      }

      setSuccess(true);
      setTimeout(() => router.push(backUrl), 1800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (nilai: number) => {
    if (nilai === 0) return "bg-gray-100 text-gray-400";
    return SCORE_CONFIG[nilai]?.color + " text-white";
  };

  const getScoreTextColor = (nilai: number) => {
    if (nilai === 0) return "text-gray-400";
    return SCORE_CONFIG[nilai]?.text || "text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">Progress Penilaian</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {filledCount} dari {AKHLAK_CONFIG.length} indikator AKHLAK dinilai
              </p>
            </div>
            <div className="text-right">
              {allFilled ? (
                <>
                  <p className="text-xs text-gray-500">Nilai Rata-rata</p>
                  <p className="text-2xl font-bold text-[#16a34a]">
                    {totalNilai.toFixed(2)}
                    <span className="text-sm font-normal text-gray-400"> / 5</span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-amber-600">
                  {AKHLAK_CONFIG.length - filledCount} lagi
                </p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-[#16a34a] h-3 rounded-full transition-all duration-500"
              style={{ width: `${(filledCount / AKHLAK_CONFIG.length) * 100}%` }}
            />
          </div>

          {/* Quick overview pills */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {AKHLAK_CONFIG.map((a) => {
              const val = entries[a.key]?.nilai || 0;
              return (
                <div
                  key={a.key}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${val > 0 ? getScoreColor(val) : "bg-gray-100 text-gray-400"}`}
                >
                  {a.label}: {val > 0 ? val : "—"}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AKHLAK Cards */}
      {AKHLAK_CONFIG.map((akhlak, idx) => {
        const entry = entries[akhlak.key] || { nilai: 0, catatan: "" };
        const isFilled = entry.nilai > 0;
        const cm = akhlak.colorMap;

        return (
          <Card
            key={akhlak.key}
            className={`border-2 transition-all ${isFilled ? cm.border + " " + cm.bg : "border-gray-100"}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                {/* Number badge */}
                <div className={`w-10 h-10 rounded-full ${cm.header} text-white flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{akhlak.label}</span>
                    {isFilled && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-white ${SCORE_CONFIG[entry.nilai]?.color}`}>
                        {entry.nilai} — {SCORE_CONFIG[entry.nilai]?.label}
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{akhlak.description}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Indikator */}
              <div className="bg-white rounded-lg border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Indikator Penilaian
                </p>
                <ul className="space-y-1.5">
                  {akhlak.indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cm.header.replace("bg-", "bg-")}`} />
                      {ind}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rating */}
              {!isCompleted && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Pilih Nilai *
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((score) => {
                      const sc = SCORE_CONFIG[score];
                      const isSelected = entry.nilai === score;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setNilai(akhlak.key, score)}
                          className={`
                            flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                            ${isSelected
                              ? `${sc.color} text-white border-transparent shadow-md scale-105`
                              : `border-gray-200 bg-white hover:${sc.bg} ${sc.text}`
                            }
                          `}
                        >
                          <span className="text-xl font-bold">{score}</span>
                          <span className="text-[10px] font-medium mt-0.5 text-center leading-tight">{sc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Score description */}
                  {entry.nilai > 0 && (
                    <p className={`text-xs mt-2 font-medium ${getScoreTextColor(entry.nilai)}`}>
                      → {SCORE_CONFIG[entry.nilai]?.desc}
                    </p>
                  )}
                </div>
              )}

              {/* Notes / Catatan */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {isCompleted ? "Catatan" : "Catatan (Opsional)"}
                  </p>
                  <span className="text-xs text-gray-400">{entry.catatan.length}/500</span>
                </div>
                <textarea
                  value={entry.catatan}
                  onChange={(e) => setCatatan(akhlak.key, e.target.value.slice(0, 500))}
                  disabled={isCompleted}
                  placeholder="Tambahkan catatan atau penjelasan untuk indikator ini... (opsional)"
                  rows={2}
                  className={`w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${isCompleted ? "bg-gray-50 cursor-not-allowed" : "bg-white border-gray-200"}`}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Summary & Submit */}
      {!isCompleted && (
        <Card className="border-gray-200">
          <CardContent className="pt-6 space-y-4">
            {/* Error / Success */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                Penilaian berhasil disimpan. Mengalihkan...
              </div>
            )}

            {/* Summary */}
            {allFilled && !success && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Ringkasan Penilaian</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {AKHLAK_CONFIG.map((a) => {
                    const val = entries[a.key]?.nilai || 0;
                    return (
                      <div key={a.key} className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full ${SCORE_CONFIG[val]?.color} text-white text-xs font-bold flex items-center justify-center`}>
                          {val}
                        </span>
                        <span className="text-gray-700 font-medium">{a.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-800">Nilai Rata-rata:</span>
                  <span className="text-2xl font-bold text-green-700">
                    {totalNilai.toFixed(2)} <span className="text-sm font-normal">/ 5.00</span>
                  </span>
                </div>
              </div>
            )}

            {!allFilled && !success && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                Lengkapi semua {AKHLAK_CONFIG.length} indikator AKHLAK sebelum menyimpan penilaian.
              </div>
            )}

            <div className="flex gap-3">
              <Button
                className="bg-[#16a34a] hover:bg-[#15803d] text-white px-8"
                onClick={() => setShowConfirm(true)}
                disabled={loading || !allFilled || success}
              >
                {loading ? "Menyimpan..." : "Simpan Penilaian"}
              </Button>
              <Button variant="outline" onClick={() => router.push(backUrl)}>
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed State */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <p className="text-sm text-green-700 font-semibold">
            Penilaian ini sudah selesai dan tidak dapat diubah.
          </p>
          <Button variant="outline" onClick={() => router.push(backUrl)}>
            Kembali ke Daftar
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penilaian</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Apakah Anda yakin ingin menyimpan penilaian ini?</p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                  {AKHLAK_CONFIG.map((a) => {
                    const val = entries[a.key]?.nilai || 0;
                    return (
                      <div key={a.key} className="flex justify-between items-center">
                        <span className="text-gray-600">{a.label}</span>
                        <span className={`font-bold ${getScoreTextColor(val)}`}>{val}/5</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                    <span className="font-semibold text-gray-800">Nilai Rata-rata</span>
                    <span className="font-bold text-[#16a34a]">{totalNilai.toFixed(2)}/5</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Penilaian yang sudah disimpan <strong>tidak dapat diubah</strong>.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className="bg-[#16a34a] hover:bg-[#15803d]"
            >
              Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
