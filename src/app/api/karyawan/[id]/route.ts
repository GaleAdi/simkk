import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface Params {
  params: { id: string };
}

// GET: Return single karyawan by karyawan.id
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HRD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const karyawan = await prisma.karyawan.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!karyawan) {
      return NextResponse.json(
        { error: "Karyawan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(karyawan);
  } catch (error) {
    console.error("Error fetching karyawan:", error);
    return NextResponse.json(
      { error: "Failed to fetch karyawan" },
      { status: 500 }
    );
  }
}

// PUT: Update karyawan (nama, jabatan, divisi, email) + optionally username
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HRD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nama, jabatan, divisi, username, email, password } = body;

    // Check if karyawan exists
    const existingKaryawan = await prisma.karyawan.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!existingKaryawan) {
      return NextResponse.json(
        { error: "Karyawan not found" },
        { status: 404 }
      );
    }

    // Check if username is being changed and if new username already exists
    if (username && username !== existingKaryawan.user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const userUpdateData: Record<string, string> = {};
    if (username) userUpdateData.username = username;
    if (email !== undefined) userUpdateData.email = email;
    if (password) {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update Karyawan
      await tx.karyawan.update({
        where: { id: params.id },
        data: {
          nama: nama || existingKaryawan.nama,
          jabatan: jabatan || existingKaryawan.jabatan,
          divisi: divisi || existingKaryawan.divisi,
        },
      });

      // Update User if there are changes
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: existingKaryawan.userId },
          data: userUpdateData,
        });
      }

      // Fetch updated data
      return tx.karyawan.findUnique({
        where: { id: params.id },
        include: {
          user: {
            select: {
              username: true,
              email: true,
              role: true,
            },
          },
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating karyawan:", error);
    return NextResponse.json(
      { error: "Failed to update karyawan" },
      { status: 500 }
    );
  }
}

// DELETE: Delete User (cascade deletes Karyawan)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HRD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if karyawan exists
    const existingKaryawan = await prisma.karyawan.findUnique({
      where: { id: params.id },
    });

    if (!existingKaryawan) {
      return NextResponse.json(
        { error: "Karyawan not found" },
        { status: 404 }
      );
    }

    // Delete the User (cascades to delete Karyawan)
    await prisma.user.delete({
      where: { id: existingKaryawan.userId },
    });

    return NextResponse.json({ message: "Karyawan deleted successfully" });
  } catch (error) {
    console.error("Error deleting karyawan:", error);
    return NextResponse.json(
      { error: "Failed to delete karyawan" },
      { status: 500 }
    );
  }
}
