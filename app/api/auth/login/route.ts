import { cookies } from "next/headers";
import { z } from "zod";

import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import { signToken } from "@/lib/jwt";
import { authenticateUser, AuthServiceError } from "@/services/auth.service";

const loginSchema = z.object({
  email: z.email("Email không hợp lệ."),
  password: z.string().min(1, "Mật khẩu là bắt buộc."),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    }

    const user = await authenticateUser(
      parsed.data.email,
      parsed.data.password,
    );
    const token = signToken({ userId: user.id, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE,
    });

    return successResponse(user);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof SyntaxError) {
      return errorResponse("Nội dung yêu cầu không hợp lệ.", 400);
    }

    return errorResponse("Không thể đăng nhập lúc này.", 500);
  }
}
