import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // hoặc thư viện hash pass bạn dùng

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Tìm user theo Email
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Tài khoản không tồn tại!" }, { status: 400 });
    }

    // 2. Kiểm tra nếu tài khoản bị KHÓA
    if (user.status === "LOCKED" || user.isBlocked) {
      return NextResponse.json({ message: "Tài khoản của bạn đã bị khóa!" }, { status: 403 });
    }

    // 3. Kiểm tra Mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Mật khẩu không chính xác!" }, { status: 400 });
    }

    // 4. Phân luồng chuyển hướng dựa trên VAI TRÒ (ROLE)
    // Nếu role là ADMIN thì vào /admin, ngược lại về Trang chủ /
    const redirectUrl = user.role === "ADMIN" ? "/admin" : "/";

    const response = NextResponse.json({
      success: true,
      redirectUrl,
      user: { id: user.id, email: user.email, role: user.role }
    });

    // 5. Lưu Cookie chứa Token/Role
    response.cookies.set("token", generateToken(user), {
      httpOnly: true,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Lỗi đăng nhập server" }, { status: 500 });
  }
}
