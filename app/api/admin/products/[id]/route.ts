import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { productSchema } from "@/lib/validations/admin";
import {
  archiveAdminProduct,
  getAdminProduct,
  updateAdminProduct,
} from "@/services/admin.service";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("ID không hợp lệ.", 422);
    const data = await getAdminProduct(id);
    return data
      ? successResponse(data)
      : errorResponse("Không tìm thấy sản phẩm.", 404);
  } catch (error) {
    return handleRouteError(error, "Không thể tải sản phẩm.");
  }
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("ID không hợp lệ.", 422);
    const parsed = productSchema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(await updateAdminProduct(id, parsed.data));
  } catch (error) {
    return handleRouteError(error, "Không thể cập nhật sản phẩm.");
  }
}
export async function DELETE(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("ID không hợp lệ.", 422);
    return successResponse(await archiveAdminProduct(id));
  } catch (error) {
    return handleRouteError(error, "Không thể lưu trữ sản phẩm.");
  }
}
