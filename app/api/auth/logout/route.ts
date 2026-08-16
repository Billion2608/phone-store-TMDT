import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });

  // Xóa cookie chứa token (thường là token, session, auth-token...)
  // Bạn có thể thêm các tên cookie khác nếu dự án có dùng
  const cookiesToClear = ["token", "session", "auth-token", "next-auth.session-token"];

  cookiesToClear.forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
  });

  return response;
}
