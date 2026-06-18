"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { Shield, Search, RefreshCw, Users, UserCheck } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
}

export default function HakAksesPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: User | null;
    newRole: string;
  }>({ open: false, user: null, newRole: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch {
      toast({ title: "Error", description: "Gagal mengambil data pengguna", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (roleFilter !== "all") filtered = filtered.filter((u) => u.role === roleFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }
    setFilteredUsers(filtered);
  };

  const handleRoleToggle = (user: User) => {
    const newRole = user.role === "HRD" ? "KARYAWAN" : "HRD";
    setConfirmDialog({ open: true, user, newRole });
  };

  const confirmRoleChange = async () => {
    if (!confirmDialog.user) return;
    setIsUpdating(confirmDialog.user.id);
    try {
      const response = await fetch(`/api/akses/${confirmDialog.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: confirmDialog.newRole }),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        toast({
          title: "Berhasil",
          description: `Role ${confirmDialog.user.username} berhasil diubah ke ${confirmDialog.newRole === "HRD" ? "HRD" : "Karyawan"}`,
        });
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error || "Gagal mengubah role", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan. Silakan coba lagi.", variant: "destructive" });
    } finally {
      setIsUpdating(null);
      setConfirmDialog({ open: false, user: null, newRole: "" });
    }
  };

  const hrdCount = users.filter((u) => u.role === "HRD").length;
  const karyawanCount = users.filter((u) => u.role === "KARYAWAN").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-violet-700 to-purple-900 rounded-2xl p-6 shadow-xl shadow-purple-700/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Hak Akses</h1>
              <p className="text-purple-100 text-sm mt-0.5">Kelola hak akses dan peran pengguna sistem</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={fetchUsers}
            disabled={isLoading}
            className="text-white hover:bg-white/20 h-9"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Total Pengguna", value: users.length, icon: Users, bg: "bg-gray-50 border-gray-200", iconBg: "bg-gray-500", iconColor: "text-white" },
          { title: "Admin HRD", value: hrdCount, icon: Shield, bg: "bg-purple-50 border-purple-200", iconBg: "bg-purple-500", iconColor: "text-white" },
          { title: "Karyawan", value: karyawanCount, icon: UserCheck, bg: "bg-blue-50 border-blue-200", iconBg: "bg-blue-500", iconColor: "text-white" },
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
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap bg-white">
          <h3 className="font-semibold text-gray-900">Daftar Pengguna</h3>
          <div className="flex items-center gap-2">
            {/* Filters */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-44"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Semua</option>
              <option value="HRD">HRD</option>
              <option value="KARYAWAN">Karyawan</option>
            </select>
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw className="w-6 h-6 text-gray-300 animate-spin mb-3" />
              <p className="text-sm text-gray-400">Memuat data...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-medium text-gray-700 mb-1">Tidak ada pengguna</p>
              <p className="text-sm text-gray-400 max-w-xs">
                {searchQuery || roleFilter !== "all" ? "Coba ubah filter pencarian" : "Belum ada pengguna yang terdaftar"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider w-10">No</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Pengguna</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
                    <th className="text-center px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Role</th>
                    <th className="text-center px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 text-gray-400 text-xs">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                            user.role === "HRD"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{user.email || "—"}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={
                          user.role === "HRD"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }>
                          {user.role === "HRD" ? "HRD" : "Karyawan"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleToggle(user)}
                          disabled={isUpdating === user.id}
                          className={`h-8 px-3 text-xs ${
                            user.role === "HRD"
                              ? "border-purple-200 text-purple-700 hover:bg-purple-50"
                              : "border-blue-200 text-blue-700 hover:bg-blue-50"
                          }`}
                        >
                          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isUpdating === user.id ? "animate-spin" : ""}`} />
                          {isUpdating === user.id ? "Memproses..." : "Ubah Role"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredUsers.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          Menampilkan {filteredUsers.length} dari {users.length} pengguna
          {(searchQuery || roleFilter !== "all") && " (terfilter)"}
        </p>
      )}

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                confirmDialog.newRole === "HRD" ? "bg-purple-100" : "bg-blue-100"
              }`}>
                <Shield className={`w-5 h-5 ${confirmDialog.newRole === "HRD" ? "text-purple-600" : "text-blue-600"}`} />
              </div>
              Ubah Role Pengguna
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 leading-relaxed">
              Apakah Anda yakin ingin mengubah role <strong>{confirmDialog.user?.username}</strong> dari{" "}
              <strong>{confirmDialog.user?.role === "HRD" ? "HRD" : "Karyawan"}</strong> menjadi{" "}
              <strong>{confirmDialog.newRole === "HRD" ? "HRD" : "Karyawan"}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              className="bg-[#16a34a] hover:bg-green-700 text-white"
            >
              Ya, Ubah
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
