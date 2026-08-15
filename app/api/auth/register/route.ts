import { z } from "zod";

import { errorResponse, successResponse } from "@/lib/api-response";
import { AuthServiceError, registerUser } from "@/services/auth.service";

const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Họ tên là bắt buộc.").max(150),
    email: z.email("Email không hợp lệ.").max(150),
    phone: z
      .string()
      .trim()
      .regex(/^(?:\+84|0)(?:\d[ .-]?){8,10}\d$/, "Số điện thoại không hợp lệ."),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự.").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    }

    const user = await registerUser(parsed.data);
    return successResponse(user, 201);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof SyntaxError) {
      return errorResponse("Nội dung yêu cầu không hợp lệ.", 400);
    }

    return errorResponse("Không thể đăng ký tài khoản lúc này.", 500);
  }
}
