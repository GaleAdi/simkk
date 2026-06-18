"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

interface KaryawanUser {
  userId: string;
  username: string;
  role: string;
  id: string;
  nama: string;
  jabatan: string;
  divisi: string;
}

const jenisOptions = [
  { value: "SELF", label: "Self Assessment — Menilai Diri Sendiri", desc: "Evaluasi kinerja diri sendiri" },
  { value: "ATASAN", label: "Penilaian Atasan — Menilai Bawahan", desc: "Atasan menilai kinerja bawahan" },
  { value: "REKAN_KERJA", label: "Rekan Kerja — Menilai Sejawat", desc: "Menilai kinerja rekan kerja" },
  { value: "BAWAHAN", label: "Penilaian Bawahan — Menilai Atasan", desc: "Bawahan menilai kinerja atasan" },
];

export function CreateAssessmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [karyawanUsers, setKaryawanUsers] = useState<KaryawanUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // targetId = User.id (userId from KaryawanUser)
  const [targetId, setTargetId] = useState("");
  const [jenis, setJenis] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/karyawan");
      if (res.ok) {
        const data = await res.json();
        setKaryawanUsers(data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Gagal mengambil data karyawan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!targetId || !jenis) {
      setError("Pilih karyawan dan jenis penilaian");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, jenis }),
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Penilaian berhasil dibuat",
          variant: "default",
        });
        handleClose();
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || "Terjadi kesalahan");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTargetId("");
    setJenis("");
    setError("");
    onOpenChange(false);
  };

  const selectedKaryawan = karyawanUsers.find((k) => k.userId === targetId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>📝 Buat Penilaian Baru</DialogTitle>
          <DialogDescription>
            Anda akan menjadi <strong>penilai</strong> dalam penilaian ini.
            Pilih karyawan yang akan dinilai dan jenis penilaiannya.
          </DialogDescription>
        </DialogHeader>

        {/* Penilai info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-green-600 font-medium">Anda sebagai</p>
            <p className="text-sm font-semibold text-green-800">Penilai</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Target: Karyawan — value = userId */}
          <div className="space-y-2">
            <Label htmlFor="target">Karyawan yang Dinilai *</Label>
            <select
              id="target"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              required
              disabled={isLoading}
            >
              <option value="">— Pilih Karyawan —</option>
              {karyawanUsers.map((k) => (
                <option key={k.userId} value={k.userId}>
                  {k.nama} · {k.jabatan} ({k.divisi})
                </option>
              ))}
            </select>
          </div>

          {/* Selected karyawan preview */}
          {selectedKaryawan && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-gray-900">{selectedKaryawan.nama}</p>
              <p className="text-gray-500">{selectedKaryawan.jabatan} · {selectedKaryawan.divisi}</p>
            </div>
          )}

          {/* Jenis Penilaian */}
          <div className="space-y-2">
            <Label htmlFor="jenis">Jenis Penilaian *</Label>
            <div className="grid grid-cols-1 gap-2">
              {jenisOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${jenis === opt.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-green-200"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="jenis"
                    value={opt.value}
                    checked={jenis === opt.value}
                    onChange={(e) => setJenis(e.target.value)}
                    className="mt-1 accent-green-600"
                  />
                  <div>
                    <p className={`text-sm font-semibold ${jenis === opt.value ? "text-green-700" : "text-gray-800"}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !targetId || !jenis}
              className="bg-[#16a34a] hover:bg-green-700"
            >
              {isSubmitting ? "Membuat..." : "Buat Penilaian"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
