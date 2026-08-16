import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  // Xóa sạch toàn bộ Cookie phiên làm việc
  response.cookies.delete("token");
  response.cookies.delete("user_role");
  response.cookies.delete("user");

  return response;
}
