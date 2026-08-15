import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { couponSchema } from "@/lib/validations/admin";
import { deleteAdminCoupon, saveAdminCoupon } from "@/services/admin.service";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("ID không hợp lệ.", 422);
    const parsed = couponSchema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(await saveAdminCoupon(id, parsed.data));
  } catch (error) {
    return handleRouteError(error, "Không thể cập nhật coupon.");
  }
}
export async function DELETE(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("ID không hợp lệ.", 422);
    return successResponse(await deleteAdminCoupon(id));
  } catch (error) {
    return handleRouteError(error, "Không thể xóa coupon.");
  }
}
