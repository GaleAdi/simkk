"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

interface Karyawan {
  id: string;
  nama: string;
  jabatan: string;
  divisi: string;
  username: string;
  email: string;
}

interface Props {
  initialData: Karyawan[];
}

export function KaryawanClient({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Karyawan | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "", jabatan: "", divisi: "", username: "", email: "", password: "",
  });
  const [error, setError] = useState("");

  const filtered = data.filter(
    (k) =>
      k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.divisi.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ nama: "", jabatan: "", divisi: "", username: "", email: "", password: "" });
    setEditItem(null);
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const url = editItem ? `/api/karyawan/${editItem.id}` : "/api/karyawan";
      const method = editItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan data");

      if (editItem) {
        setData(data.map((k) => k.id === editItem.id ? { ...k, ...form } : k));
      } else {
        setData([...data, { id: json.id, ...form }]);
      }
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus karyawan ini?")) return;
    try {
      const res = await fetch(`/api/karyawan/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setData(data.filter((k) => k.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (k: Karyawan) => {
    setEditItem(k);
    setForm({ nama: k.nama, jabatan: k.jabatan, divisi: k.divisi, username: k.username, email: k.email, password: "" });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nama atau divisi..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          className="bg-[#16a34a] hover:bg-[#15803d] text-white"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Karyawan
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-base">
              {editItem ? "Edit Karyawan" : "Tambah Karyawan Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Nama *</label>
                <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Jabatan *</label>
                <Input value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} placeholder="Jabatan" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Divisi *</label>
                <Input value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })} placeholder="Divisi" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Username *</label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username login" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (opsional)" type="email" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password {editItem ? "(kosongkan jika tidak diubah)" : "*"}
                </label>
                <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className="bg-[#16a34a] hover:bg-[#15803d] text-white"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-600">No</th>
                  <th className="text-left p-4 font-medium text-gray-600">Nama</th>
                  <th className="text-left p-4 font-medium text-gray-600">Jabatan</th>
                  <th className="text-left p-4 font-medium text-gray-600">Divisi</th>
                  <th className="text-left p-4 font-medium text-gray-600">Username</th>
                  <th className="text-left p-4 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      Tidak ada data karyawan
                    </td>
                  </tr>
                ) : (
                  filtered.map((k, i) => (
                    <tr key={k.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-500">{i + 1}</td>
                      <td className="p-4 font-medium text-gray-900">{k.nama}</td>
                      <td className="p-4 text-gray-600">{k.jabatan}</td>
                      <td className="p-4 text-gray-600">{k.divisi}</td>
                      <td className="p-4 text-gray-600">{k.username}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(k)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(k.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
