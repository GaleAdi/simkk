import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";

export default async function HRDDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "HRD") redirect("/dashboard/karyawan");

  const hrd = await prisma.hRD.findUnique({
    where: { userId: session.user.id },
  });
  const userName = hrd?.nama || session.user.username;
  const now = new Date();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userName={userName} userRole="HRD" />
      <main className="flex-1">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#16a34a] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">SIMKK</h2>
              <p className="text-xs text-gray-400">PT Energi Nusantara</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">
              {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
