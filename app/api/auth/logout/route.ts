import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Đăng xuất thành công" });

  // Danh sách các tên cookie thường dùng để lưu token
  const cookieNames = ["token", "auth_token", "session", "user_session", "next-auth.session-token"];

  cookieNames.forEach((name) => {
    response.cookies.set(name, "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
  });

  return response;
}
