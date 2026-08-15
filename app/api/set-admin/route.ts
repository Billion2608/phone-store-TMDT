import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("admin@1234", 10);

    // Tạo mới hoặc cập nhật tài khoản admin@gmail.com
    const admin = await prisma.user.upsert({
      where: { email: "admin@gmail.com" },
      update: {
        password: hashedPassword,
        role: "ADMIN" as any,
        status: "ACTIVE" as any,
      },
      create: {
        email: "admin@gmail.com",
        password: hashedPassword,
        fullName: "Administrator",
        phone: "0900444333",
        role: "ADMIN" as any,
        status: "ACTIVE" as any,
      },
    });

    return NextResponse.json({
      message: "Cấp quyền Admin thành công!",
      email: admin.email,
      password: "admin@1234",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
