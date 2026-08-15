import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Đã đăng xuất" });

  // Xóa cookie token xác thực
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
