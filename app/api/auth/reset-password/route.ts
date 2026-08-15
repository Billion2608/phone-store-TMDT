import { z } from "zod";
import { errorResponse, successResponse } from "@/lib/api-response";
import { AuthServiceError, resetPassword } from "@/services/auth.service";

const schema = z
  .object({
    token: z.string().min(32),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự.").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(
      await resetPassword(parsed.data.token, parsed.data.password),
    );
  } catch (error) {
    if (error instanceof AuthServiceError)
      return errorResponse(error.message, error.status);
    return errorResponse("Không thể đặt lại mật khẩu.", 500);
  }
}
