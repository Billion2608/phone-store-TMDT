import { z } from "zod";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { updateProfile } from "@/services/auth.service";
const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự.")
    .max(150),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+84|0)(?:\d[ .-]?){8,10}\d$/, "Số điện thoại không hợp lệ."),
  province: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100),
  ward: z.string().trim().min(2).max(100),
  address: z.string().trim().min(3).max(255),
});
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Thông tin không hợp lệ.",
        422,
      );
    return successResponse(await updateProfile(user.id, parsed.data));
  } catch (error) {
    return handleRouteError(error, "Không thể cập nhật thông tin tài khoản.");
  }
}
