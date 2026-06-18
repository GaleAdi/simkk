import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Return assessment results based on role
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isHRD = session.user.role === "HRD";

    if (isHRD) {
      // Return all results with karyawan data
      const results = await prisma.assessmentResult.findMany({
        include: {
          karyawan: {
            select: {
              id: true,
              nama: true,
              jabatan: true,
              divisi: true,
            },
          },
        },
        orderBy: {
          nilaiAkhir: "desc",
        },
      });
      return NextResponse.json(results);
    } else {
      // Return only own result
      const karyawan = await prisma.karyawan.findUnique({
        where: { userId: session.user.id },
      });

      if (!karyawan) {
        return NextResponse.json([]);
      }

      const results = await prisma.assessmentResult.findMany({
        where: { karyawanId: karyawan.id },
        include: {
          karyawan: {
            select: {
              id: true,
              nama: true,
              jabatan: true,
              divisi: true,
            },
          },
        },
      });

      return NextResponse.json(results);
    }
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
