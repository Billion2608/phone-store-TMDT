import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { successResponse } from "@/lib/api-response";

export async function POST() {
  (await cookies()).delete(AUTH_COOKIE_NAME);
  return successResponse({ message: "Đăng xuất thành công." });
}
