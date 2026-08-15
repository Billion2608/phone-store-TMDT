import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { brandSchema } from "@/lib/validations/admin";
import { getAdminBrands, saveAdminBrand } from "@/services/admin.service";
export async function GET() {
  try {
    await requireAdmin();
    return successResponse(await getAdminBrands());
  } catch (error) {
    return handleRouteError(error, "Không thể tải thương hiệu.");
  }
}
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = brandSchema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(await saveAdminBrand(null, parsed.data), 201);
  } catch (error) {
    return handleRouteError(error, "Không thể tạo thương hiệu.");
  }
}
