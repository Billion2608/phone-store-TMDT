import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { categorySchema } from "@/lib/validations/admin";
import {
  getAdminCategories,
  saveAdminCategory,
} from "@/services/admin.service";
export async function GET() {
  try {
    await requireAdmin();
    return successResponse(await getAdminCategories());
  } catch (error) {
    return handleRouteError(error, "Không thể tải danh mục.");
  }
}
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = categorySchema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(await saveAdminCategory(null, parsed.data), 201);
  } catch (error) {
    return handleRouteError(error, "Không thể tạo danh mục.");
  }
}
