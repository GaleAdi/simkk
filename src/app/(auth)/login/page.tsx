"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Username atau password salah");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/session");
      const session = await response.json();

      const redirectTo =
        session?.user?.role === "HRD" ? "/dashboard/hrd" : "/dashboard/karyawan";
      router.push(callbackUrl || redirectTo);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fade-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-sm font-medium text-gray-700">
          Username
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <Input
            id="username"
            type="text"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className="pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-xl shadow-lg shadow-green-600/20 btn-press transition-all"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Memproses...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Masuk
          </span>
        )}
      </Button>
    </form>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
      </div>
      <div className="space-y-1.5">
        <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
        <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
      </div>
      <div className="h-11 w-full bg-green-100 rounded-xl animate-pulse" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#16a34a] via-green-700 to-emerald-800">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl" />
          <div className="absolute top-20 left-20 w-64 h-64 border border-white/10 rounded-full" />
          <div className="absolute bottom-40 right-10 w-48 h-48 border border-white/10 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">SIMKK</h1>
              <p className="text-green-200 text-sm">PT Energi Nusantara</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Sistem Informasi<br/>
            <span className="text-green-300">Manajemen Kinerja</span><br/>
            Karyawan
          </h2>
          <p className="text-green-100/80 text-lg leading-relaxed max-w-md mb-12">
            Wujudkan penilaian kinerja yang adil, transparan, dan akuntabel dengan pendekatan AKHLAK.
          </p>

          {/* AKHLAK Preview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-green-200 text-xs font-semibold uppercase tracking-wider mb-4">
              Nilai AKHLAK
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "A", name: "Amanah", color: "from-blue-400 to-blue-600" },
                { label: "K", name: "Kompeten", color: "from-purple-400 to-purple-600" },
                { label: "H", name: "Harmonis", color: "from-green-400 to-green-600" },
                { label: "L", name: "Loyal", color: "from-red-400 to-red-600" },
                { label: "A", name: "Adaptif", color: "from-amber-400 to-amber-600" },
                { label: "K", name: "Kolaboratif", color: "from-teal-400 to-teal-600" },
              ].map((akhlak) => (
                <div key={akhlak.name} className="text-center">
                  <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${akhlak.color} flex items-center justify-center text-white font-bold text-sm mb-1 shadow-lg`}>
                    {akhlak.label}
                  </div>
                  <p className="text-white/80 text-[10px]">{akhlak.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            {[
              { value: "6", label: "Indikator AKHLAK" },
              { value: "360°", label: "Penilaian" },
              { value: "100%", label: "Transparan" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-green-200/70 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#16a34a] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SIMKK</h1>
              <p className="text-xs text-gray-500">PT Energi Nusantara</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Selamat Datang</h2>
            <p className="text-gray-500 text-sm">
              Masuk ke akun Anda untuk mengelola kinerja karyawan
            </p>
          </div>

          <Card className="border-0 shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <Suspense fallback={<LoginFormSkeleton />}>
                <LoginForm />
              </Suspense>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2024 PT Energi Nusantara. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
