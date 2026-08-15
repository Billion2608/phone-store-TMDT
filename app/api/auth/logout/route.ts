import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Đăng xuất thành công" });

  // Xóa cookie token đăng nhập (thay "token" bằng tên cookie dự án bạn đang dùng nếu khác)
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
