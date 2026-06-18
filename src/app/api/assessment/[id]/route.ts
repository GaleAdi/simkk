import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAndSaveResult } from "@/lib/calculateResult";

// GET: Return assessment with formEntries
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
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
        formEntries: {
          orderBy: {
            indikator: "asc",
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

// PUT: Update assessment formEntries and set status COMPLETED
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { entries } = body;

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Entries array is required" },
        { status: 400 }
      );
    }

    // Verify the assessment exists and user is the penilai
    const existingAssessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: { target: true },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (existingAssessment.penilaiId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to fill this assessment" },
        { status: 403 }
      );
    }

    if (existingAssessment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment already completed" },
        { status: 400 }
      );
    }

    // Update form entries and status in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update each form entry (nilai + catatan)
      for (const entry of entries) {
        await tx.assessmentForm.updateMany({
          where: {
            assessmentId: params.id,
            indikator: entry.indikator,
          },
          data: {
            nilai: entry.nilai,
            catatan: entry.catatan || null,
          },
        });
      }

      // Update assessment status to COMPLETED
      const updatedAssessment = await tx.assessment.update({
        where: { id: params.id },
        data: { status: "COMPLETED" },
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

      return updatedAssessment;
    });

    // Trigger recalculation of AssessmentResult for target
    await calculateAndSaveResult(existingAssessment.targetId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan penilaian" },
      { status: 500 }
    );
  }
}

// DELETE: Delete assessment (HRD only or penilai for PENDING assessments)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment tidak ditemukan" },
        { status: 404 }
      );
    }

    // Only HRD can delete, OR penilai can delete PENDING assessments
    const isHRD = session.user.role === "HRD";
    const isPenilai = assessment.penilaiId === session.user.id;
    const isPending = assessment.status === "PENDING";

    if (!isHRD && !(isPenilai && isPending)) {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin untuk menghapus penilaian ini" },
        { status: 403 }
      );
    }

    // Delete the assessment (cascade deletes formEntries)
    await prisma.assessment.delete({
      where: { id: params.id },
    });

    // Recalculate result for target (remove this assessment's contribution)
    await calculateAndSaveResult(assessment.targetId);

    return NextResponse.json({ success: true, message: "Penilaian berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { error: "Gagal menghapus penilaian" },
      { status: 500 }
    );
  }
}
