"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Home, Users, ClipboardList, BarChart3, FileText, Shield, User } from "lucide-react";

interface SidebarProps {
  userName: string;
  userRole: "HRD" | "KARYAWAN";
}

const hrdNavItems = [
  { title: "Dashboard", href: "/dashboard/hrd", icon: Home },
  { title: "Manajemen Karyawan", href: "/dashboard/hrd/karyawan", icon: Users },
  { title: "Penilaian Kinerja", href: "/dashboard/hrd/penilaian", icon: ClipboardList },
  { title: "Hasil Penilaian", href: "/dashboard/hrd/hasil", icon: BarChart3 },
  { title: "Laporan", href: "/dashboard/hrd/laporan", icon: FileText },
  { title: "Hak Akses", href: "/dashboard/hrd/hak-akses", icon: Shield },
];

const karyawanNavItems = [
  { title: "Dashboard", href: "/dashboard/karyawan", icon: Home },
  { title: "Penilaian Kinerja", href: "/dashboard/karyawan/penilaian", icon: ClipboardList },
  { title: "Hasil Penilaian", href: "/dashboard/karyawan/hasil", icon: BarChart3 },
  { title: "Profil Saya", href: "/dashboard/karyawan/profil", icon: User },
];

export function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const navItems = userRole === "HRD" ? hrdNavItems : karyawanNavItems;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100 bg-gradient-to-r from-[#16a34a] to-emerald-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-tight">SIMKK</h1>
            <p className="text-green-200 text-[10px]">PT Energi Nusantara</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        <p className="px-3 pb-2 text-[10px] font-semibold text-gray-300 uppercase tracking-widest">
          {userRole === "HRD" ? "Menu HRD" : "Menu Karyawan"}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#16a34a] text-white shadow-lg shadow-green-600/25"
                  : "text-gray-500 hover:bg-green-50 hover:text-[#16a34a]"
              )}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3 border border-green-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
              userRole === "HRD"
                ? "bg-purple-100 text-purple-700"
                : "bg-[#16a34a]/10 text-[#16a34a]"
            }`}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-[11px] text-gray-400 capitalize">{userRole === "HRD" ? "Admin HRD" : "Karyawan"}</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-9 rounded-xl text-sm font-medium"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Keluar
        </Button>
      </div>
    </aside>
  );
}
