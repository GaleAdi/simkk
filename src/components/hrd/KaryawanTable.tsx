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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Search, UserPlus, RefreshCw } from "lucide-react";

interface Karyawan {
  id: string;
  nama: string;
  jabatan: string;
  divisi: string;
  user: {
    username: string;
    email: string | null;
    role: string;
  };
}

interface KaryawanFormData {
  nama: string;
  jabatan: string;
  divisi: string;
  username: string;
  email: string;
  password: string;
}

const initialFormData: KaryawanFormData = {
  nama: "",
  jabatan: "",
  divisi: "",
  username: "",
  email: "",
  password: "",
};

const divisiOptions = [
  "Keuangan", "Pemasaran", "Operasi", "HRD", "IT", "Produksi", "Logistik", "Umum",
];

const divisiColors: Record<string, string> = {
  Keuangan: "bg-blue-50 text-blue-700 border-blue-200",
  Pemasaran: "bg-pink-50 text-pink-700 border-pink-200",
  Operasi: "bg-orange-50 text-orange-700 border-orange-200",
  HRD: "bg-purple-50 text-purple-700 border-purple-200",
  IT: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Produksi: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Logistik: "bg-teal-50 text-teal-700 border-teal-200",
  Umum: "bg-gray-50 text-gray-700 border-gray-200",
};

interface KaryawanTableProps {
  initialKaryawans?: Karyawan[];
}

export function KaryawanTable({ initialKaryawans = [] }: KaryawanTableProps) {
  const [karyawans, setKaryawans] = useState<Karyawan[]>(initialKaryawans);
  const [filteredKaryawans, setFilteredKaryawans] = useState<Karyawan[]>(initialKaryawans);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingKaryawan, setEditingKaryawan] = useState<Karyawan | null>(null);
  const [deletingKaryawan, setDeletingKaryawan] = useState<Karyawan | null>(null);
  const [formData, setFormData] = useState<KaryawanFormData>(initialFormData);
  const [formError, setFormError] = useState("");

  const { toast } = useToast();

  const fetchKaryawans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/karyawan", { credentials: "include" });
      if (response.ok) {
        const data: Karyawan[] = await response.json();
        setKaryawans(data);
        setFilteredKaryawans(data);
      }
    } catch {
      toast({ title: "Error", description: "Gagal mengambil data karyawan", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredKaryawans(
      karyawans.filter(
        (k) =>
          k.nama.toLowerCase().includes(query) ||
          k.divisi.toLowerCase().includes(query) ||
          k.user.username.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, karyawans]);

  const handleOpenDialog = (karyawan?: Karyawan) => {
    if (karyawan) {
      setEditingKaryawan(karyawan);
      setFormData({
        nama: karyawan.nama,
        jabatan: karyawan.jabatan,
        divisi: karyawan.divisi,
        username: karyawan.user.username,
        email: karyawan.user.email || "",
        password: "",
      });
    } else {
      setEditingKaryawan(null);
      setFormData(initialFormData);
    }
    setFormError("");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingKaryawan(null);
    setFormData(initialFormData);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!formData.nama || !formData.jabatan || !formData.divisi || !formData.username) {
      setFormError("Semua field wajib diisi");
      return;
    }
    if (!editingKaryawan && !formData.password) {
      setFormError("Password wajib diisi untuk karyawan baru");
      return;
    }
    setIsSubmitting(true);
    try {
      const url = editingKaryawan ? `/api/karyawan/${editingKaryawan.id}` : "/api/karyawan";
      const method = editingKaryawan ? "PUT" : "POST";
      const payload: Record<string, string> = {
        nama: formData.nama,
        jabatan: formData.jabatan,
        divisi: formData.divisi,
        username: formData.username,
        email: formData.email,
      };
      if (formData.password) payload.password = formData.password;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (response.ok) {
        toast({
          title: "Berhasil",
          description: editingKaryawan ? "Data karyawan berhasil diperbarui" : "Karyawan baru berhasil ditambahkan",
        });
        handleCloseDialog();
        fetchKaryawans();
      } else {
        const error = await response.json();
        setFormError(error.error || "Terjadi kesalahan");
      }
    } catch {
      setFormError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingKaryawan) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/karyawan/${deletingKaryawan.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        toast({ title: "Berhasil", description: "Karyawan berhasil dihapus" });
        setIsDeleteDialogOpen(false);
        setDeletingKaryawan(null);
        fetchKaryawans();
      } else {
        toast({ title: "Error", description: "Gagal menghapus karyawan", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan. Silakan coba lagi.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nama, divisi, atau username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 w-full sm:w-64 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchKaryawans} disabled={isLoading} className="h-9">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => handleOpenDialog()} className="bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg shadow-green-600/20 btn-press h-9">
            <UserPlus className="h-4 w-4 mr-2" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">No</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Karyawan</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Divisi</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-36 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && filteredKaryawans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filteredKaryawans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                      <UserPlus className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="font-medium text-gray-600 mb-1">
                      {searchQuery ? "Tidak ada hasil" : "Belum ada karyawan"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {searchQuery ? "Coba kata kunci lain" : "Tambah karyawan baru untuk memulai"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredKaryawans.map((karyawan, index) => (
                <TableRow key={karyawan.id} className="hover:bg-gray-50/60 transition-colors group">
                  <TableCell className="text-gray-400 text-xs">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#16a34a]/10 rounded-xl flex items-center justify-center text-sm font-bold text-[#16a34a]">
                        {karyawan.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{karyawan.nama}</p>
                        <p className="text-xs text-gray-400">{karyawan.jabatan}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${divisiColors[karyawan.divisi] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                      {karyawan.divisi}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600 text-sm">@{karyawan.user.username}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenDialog(karyawan)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setDeletingKaryawan(karyawan); setIsDeleteDialogOpen(true); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredKaryawans.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Menampilkan {filteredKaryawans.length} dari {karyawans.length} karyawan
          {searchQuery && " (terfilter)"}
        </p>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-[#16a34a] rounded-xl flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-lg">
                {editingKaryawan ? "Edit Karyawan" : "Tambah Karyawan Baru"}
              </DialogTitle>
            </div>
            <p className="text-sm text-gray-500">
              {editingKaryawan ? "Perbarui data karyawan di bawah ini" : "Masukkan data karyawan baru"}
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formError}
              </div>
            )}

            {[
              { label: "Nama Lengkap *", key: "nama" as const, placeholder: "Masukkan nama lengkap" },
              { label: "Jabatan *", key: "jabatan" as const, placeholder: "Masukkan jabatan" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <Input
                  value={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  placeholder={placeholder}
                  required
                  className="h-10 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Divisi *</label>
              <select
                value={formData.divisi}
                onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                required
              >
                <option value="">Pilih Divisi</option>
                {divisiOptions.map((div) => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>

            {[
              { label: "Username *", key: "username" as const, placeholder: "Masukkan username", type: "text" },
              { label: "Email", key: "email" as const, placeholder: "Masukkan email (opsional)", type: "email" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <Input
                  type={type}
                  value={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="h-10 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Password {editingKaryawan ? "(kosongkan jika tidak diubah)" : "*"}
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingKaryawan ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                required={!editingKaryawan}
                className="h-10 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1 h-10 rounded-xl">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white h-10 rounded-xl shadow-lg shadow-green-600/20 btn-press"
              >
                {isSubmitting ? "Memproses..." : editingKaryawan ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              Hapus Karyawan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>{deletingKaryawan?.nama}</strong>? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
