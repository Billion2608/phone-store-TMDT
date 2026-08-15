import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { orderStatusSchema } from "@/lib/validations/admin";
import { updateAdminOrderStatus } from "@/services/admin.service";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("ID không hợp lệ.", 422);
    const parsed = orderStatusSchema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(
      await updateAdminOrderStatus(
        admin.id,
        id,
        parsed.data.status,
        parsed.data.note,
        parsed.data.cancelledReason,
      ),
    );
  } catch (error) {
    return handleRouteError(error, "Không thể đổi trạng thái đơn hàng.");
  }
}
