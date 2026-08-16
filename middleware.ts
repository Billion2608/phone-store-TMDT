import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bảo vệ toàn bộ đường dẫn bắt đầu bằng /admin
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;
    const userRole = request.cookies.get("user_role")?.value;

    // Không có Token hoặc Role không phải ADMIN/MANAGER -> Đẩy về /login
    if (!token || (userRole !== "ADMIN" && userRole !== "MANAGER")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
