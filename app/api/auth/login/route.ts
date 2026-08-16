import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getProducts } from "@/services/product.service"; // Dùng để kiểm tra kết nối nếu cần

// Đảm bảo dùng đúng file db trong project của bạn
// Bạn hãy kiểm tra lại đường dẫn import db trong dự án (thường là "@/lib/db" hoặc "@/lib/prisma")
import { db } from "@/lib/db"; 

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

    // 1. Tìm user theo Email
    const user = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu không chính xác!" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra nếu tài khoản đang bị KHÓA
    if (user.status === "LOCKED" || user.status === "BLOCKED" || user.isBlocked) {
      return NextResponse.json(
        { message: "Tài khoản của bạn đã bị khóa!" },
        { status: 403 }
      );
    }

    // 3. Kiểm tra Mật khẩu (so sánh mã hóa hoặc chuỗi gốc)
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
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // 5. Lưu Cookie phiên đăng nhập
    response.cookies.set("token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
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
      { message: "Lỗi kết nối cơ sở dữ liệu. Vui lòng kiểm tra lại file db!" },
      { status: 500 }
    );
  }
}
