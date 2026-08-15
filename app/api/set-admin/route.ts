import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Thiếu tham số email" }, { status: 400 });
  }

  try {
    const user = await prisma.users.update({
      where: { email },
      data: { role: "ADMIN" },
    });
    return NextResponse.json({ message: "Cấp quyền ADMIN thành công!", user });
  } catch (error) {
    return NextResponse.json({ error: "Không tìm thấy email này trong CSDL" }, { status: 404 });
  }
}