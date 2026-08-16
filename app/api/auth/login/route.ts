import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; // Import chính xác theo dự án của bạn

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ email và mật khẩu!" },
        { status: 400 }
      );
    }

    // 1. Tìm user trong Database bằng Prisma
    const user = await prisma.users.findFirst({
      where: { 
        email: email.trim().toLowerCase() 
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu không chính xác!" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra tài khoản bị khóa (status trong DB)
    if (user.status === "LOCKED" || user.status === "INACTIVE") {
      return NextResponse.json(
        { message: "Tài khoản của bạn đã bị khóa!" },
        { status: 403 }
      );
    }

    // 3. Kiểm tra mật khẩu (Xử lý cả mật khẩu mã hóa bcrypt hoặc mật khẩu thường)
    let isPasswordValid = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = user.password === password;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu không chính xác!" },
        { status: 400 }
      );
    }

    // 4. CHUYỂN HƯỚNG THEO VAI TRÒ (ROLE)
    // - Khách hàng (USER/CUSTOMER) -> Chuyển về Trang chủ "/"
    // - Quản trị viên (ADMIN/MANAGER) -> Chuyển vào "/admin"
    const userRole = (user.role || "").toUpperCase();
    const isAdmin = userRole === "ADMIN" || userRole === "MANAGER";
    const redirectUrl = isAdmin ? "/admin" : "/";

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công!",
      redirectUrl,
      user: {
        id: user.id.toString(),
        name: user.full_name || user.email,
        email: user.email,
        role: user.role,
      },
    });

    // 5. Lưu Session Cookie
    response.cookies.set("token", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set("user_role", user.role || "USER", {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return NextResponse.json(
      { message: "Có lỗi hệ thống xảy ra khi đăng nhập!" },
      { status: 500 }
    );
  }
}
