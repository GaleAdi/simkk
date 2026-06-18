import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /dashboard/* routes
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect unauthenticated users to login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as string;

    // HRD cannot access /dashboard/karyawan
    if (pathname.startsWith("/dashboard/karyawan") && userRole !== "KARYAWAN") {
      return NextResponse.redirect(new URL("/dashboard/hrd", request.url));
    }

    // Karyawan cannot access /dashboard/hrd
    if (pathname.startsWith("/dashboard/hrd") && userRole !== "HRD") {
      return NextResponse.redirect(new URL("/dashboard/karyawan", request.url));
    }
  }

  // Redirect authenticated users away from login
  if (pathname === "/login") {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      const userRole = token.role as string;
      const redirectUrl =
        userRole === "HRD" ? "/dashboard/hrd" : "/dashboard/karyawan";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
