import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AKHLAK } from "@prisma/client";

// GET: Return assessments based on role
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isHRD = session.user.role === "HRD";

    const assessments = await prisma.assessment.findMany({
      where: isHRD ? {} : { penilaiId: session.user.id },
      include: {
        target: {
          select: {
            id: true,
            nama: true,
            jabatan: true,
            divisi: true,
          },
        },
        penilai: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

// POST: Create new assessment — penilai auto-filled from session user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetId, jenis } = body;

    // Validation — penilaiId auto from session
    if (!targetId || !jenis) {
      return NextResponse.json(
        { error: "Target dan jenis penilaian wajib dipilih" },
        { status: 400 }
      );
    }

    // Prevent self-assessment if jenis is not SELF
    // targetId is User.id — resolve to Karyawan.id
    const karyawan = await prisma.karyawan.findUnique({
      where: { userId: targetId },
    });

    if (!karyawan) {
      return NextResponse.json(
        { error: "Karyawan tidak ditemukan" },
        { status: 404 }
      );
    }

    // penilaiId auto from session
    const penilaiId = session.user.id;

    // Check for duplicate
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        targetId: karyawan.id,
        penilaiId,
        jenis,
      },
    });

    if (existingAssessment) {
      return NextResponse.json(
        { error: "Penilaian ini sudah pernah dibuat" },
        { status: 400 }
      );
    }

    // Create assessment with 6 form entries (one per AKHLAK)
    const result = await prisma.assessment.create({
      data: {
        targetId: karyawan.id,
        penilaiId,
        jenis,
        status: "PENDING",
        formEntries: {
          create: [
            { indikator: AKHLAK.AMANAH, nilai: 0 },
            { indikator: AKHLAK.KOMPETEN, nilai: 0 },
            { indikator: AKHLAK.HARMONIS, nilai: 0 },
            { indikator: AKHLAK.LOYAL, nilai: 0 },
            { indikator: AKHLAK.ADAPTIF, nilai: 0 },
            { indikator: AKHLAK.KOLABORATIF, nilai: 0 },
          ],
        },
      },
      include: {
        target: {
          select: {
            id: true,
            nama: true,
            jabatan: true,
            divisi: true,
          },
        },
        penilai: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        formEntries: true,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Gagal membuat penilaian" },
      { status: 500 }
    );
  }
}
