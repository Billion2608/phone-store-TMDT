import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { productSchema } from "@/lib/validations/admin";
import { createAdminProduct, getAdminProducts } from "@/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    return successResponse(await getAdminProducts());
  } catch (error) {
    return handleRouteError(error, "Không thể tải sản phẩm.");
  }
}
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = productSchema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(await createAdminProduct(parsed.data), 201);
  } catch (error) {
    return handleRouteError(error, "Không thể tạo sản phẩm.");
  }
}
