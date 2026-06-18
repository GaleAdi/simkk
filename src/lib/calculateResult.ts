import { prisma } from "@/lib/prisma";
import { AKHLAK } from "@prisma/client";

export async function calculateAndSaveResult(karyawanId: string) {
  try {
    // Fetch all COMPLETED assessments for this karyawan
    const completedAssessments = await prisma.assessment.findMany({
      where: {
        targetId: karyawanId,
        status: "COMPLETED",
      },
      include: {
        formEntries: true,
      },
    });

    if (completedAssessments.length === 0) {
      // No completed assessments, delete any existing result
      await prisma.assessmentResult.deleteMany({
        where: { karyawanId },
      });
      return null;
    }

    // Calculate average for each AKHLAK indikator
    const indikatorAverages: Record<string, number> = {
      AMANAH: 0,
      KOMPETEN: 0,
      HARMONIS: 0,
      LOYAL: 0,
      ADAPTIF: 0,
      KOLABORATIF: 0,
    };

    const countMap: Record<string, number> = {
      AMANAH: 0,
      KOMPETEN: 0,
      HARMONIS: 0,
      LOYAL: 0,
      ADAPTIF: 0,
      KOLABORATIF: 0,
    };

    for (const assessment of completedAssessments) {
      for (const entry of assessment.formEntries) {
        if (entry.nilai > 0) {
          indikatorAverages[entry.indikator] += entry.nilai;
          countMap[entry.indikator]++;
        }
      }
    }

    // Calculate final averages
    for (const indikator of Object.keys(indikatorAverages)) {
      if (countMap[indikator] > 0) {
        indikatorAverages[indikator] = indikatorAverages[indikator] / countMap[indikator];
      }
    }

    // Calculate overall score (average of all 6 indikator)
    const totalIndikator = Object.keys(indikatorAverages).length;
    const sumAll = Object.values(indikatorAverages).reduce((sum, val) => sum + val, 0);
    const nilaiAkhir = sumAll / totalIndikator;

    // Upsert AssessmentResult
    const result = await prisma.assessmentResult.upsert({
      where: {
        karyawanId,
      },
      update: {
        amanah: indikatorAverages.AMANAH,
        kompeten: indikatorAverages.KOMPETEN,
        harmonis: indikatorAverages.HARMONIS,
        loyal: indikatorAverages.LOYAL,
        adaptif: indikatorAverages.ADAPTIF,
        kolaboratif: indikatorAverages.KOLABORATIF,
        nilaiAkhir,
        calculatedAt: new Date(),
      },
      create: {
        karyawanId,
        amanah: indikatorAverages.AMANAH,
        kompeten: indikatorAverages.KOMPETEN,
        harmonis: indikatorAverages.HARMONIS,
        loyal: indikatorAverages.LOYAL,
        adaptif: indikatorAverages.ADAPTIF,
        kolaboratif: indikatorAverages.KOLABORATIF,
        nilaiAkhir,
      },
    });

    return result;
  } catch (error) {
    console.error("Error calculating result:", error);
    throw error;
  }
}
