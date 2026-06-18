import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

// GET: Return all KARYAWAN users with their Karyawan profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HRD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const karyawans = await prisma.user.findMany({
      where: { role: Role.KARYAWAN },
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
      orderBy: { username: "asc" },
    });

    // Only return users that have a Karyawan profile
    const result = karyawans
      .filter((u) => u.karyawan !== null)
      .map((u) => ({
        userId: u.id,
        username: u.username,
        role: u.role,
        ...u.karyawan,
      }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching karyawans:", error);
    return NextResponse.json(
      { error: "Failed to fetch karyawans" },
      { status: 500 }
    );
  }
}

// POST: Create new User (KARYAWAN) + Karyawan record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HRD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nama, jabatan, divisi, username, email, password } = body;

    if (!nama || !jabatan || !divisi || !username || !password) {
      return NextResponse.json(
        { error: "Nama, jabatan, divisi, username, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          email: email || null,
          role: Role.KARYAWAN,
          karyawan: {
            create: {
              nama,
              jabatan,
              divisi,
            },
          },
        },
        include: {
          karyawan: true,
        },
      });

      return user;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating karyawan:", error);
    return NextResponse.json(
      { error: "Failed to create karyawan" },
      { status: 500 }
    );
  }
}
