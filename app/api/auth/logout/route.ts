import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // 1. Xóa bằng cookies() API của Next.js
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  allCookies.forEach((c) => {
    cookieStore.delete(c.name);
  });

  // 2. Xóa đè thêm 1 lần nữa ở Response Header để đảm bảo browser chấp nhận
  const commonCookieNames = ["token", "session", "auth_token", "next-auth.session-token"];
  
  commonCookieNames.forEach((name) => {
    response.cookies.set(name, "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
      maxAge: 0,
    });
  });

  return response;
}
