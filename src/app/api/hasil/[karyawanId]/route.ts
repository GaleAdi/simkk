import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Return detailed result for one karyawan
export async function GET(
  request: NextRequest,
  { params }: { params: { karyawanId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check authorization
    const isHRD = session.user.role === "HRD";
    if (!isHRD) {
      // Karyawan can only view their own results
      const ownKaryawan = await prisma.karyawan.findUnique({
        where: { userId: session.user.id },
      });

      if (!ownKaryawan || ownKaryawan.id !== params.karyawanId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get the result
    const result = await prisma.assessmentResult.findFirst({
      where: { karyawanId: params.karyawanId },
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

    if (!result) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    // Get all completed assessments for this karyawan grouped by jenis
    const assessments = await prisma.assessment.findMany({
      where: {
        targetId: params.karyawanId,
        status: "COMPLETED",
      },
      include: {
        penilai: {
          select: {
            id: true,
            username: true,
          },
        },
        formEntries: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group assessments by jenis and calculate averages per jenis
    const breakdownByJenis: Record<string, { count: number; scores: Record<string, number> }> = {};

    for (const assessment of assessments) {
      const jenis = assessment.jenis;
      if (!breakdownByJenis[jenis]) {
        breakdownByJenis[jenis] = { count: 0, scores: {} };
      }
      breakdownByJenis[jenis].count++;

      // Sum up scores for each indikator
      for (const entry of assessment.formEntries) {
        if (!breakdownByJenis[jenis].scores[entry.indikator]) {
          breakdownByJenis[jenis].scores[entry.indikator] = 0;
        }
        breakdownByJenis[jenis].scores[entry.indikator] += entry.nilai;
      }
    }

    // Calculate averages for each jenis
    const breakdown = Object.entries(breakdownByJenis).map(([jenis, data]) => {
      const scores: Record<string, number> = {};
      for (const [indikator, sum] of Object.entries(data.scores)) {
        scores[indikator] = sum / data.count;
      }
      return {
        jenis,
        count: data.count,
        scores,
      };
    });

    return NextResponse.json({
      result,
      breakdown,
      totalAssessments: assessments.length,
    });
  } catch (error) {
    console.error("Error fetching detailed result:", error);
    return NextResponse.json(
      { error: "Failed to fetch result" },
      { status: 500 }
    );
  }
}
