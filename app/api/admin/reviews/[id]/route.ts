import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { reviewStatusSchema } from "@/lib/validations/admin";
import { updateAdminReview } from "@/services/admin.service";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("ID không hợp lệ.", 422);
    const parsed = reviewStatusSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse("Trạng thái không hợp lệ.", 422);
    return successResponse(await updateAdminReview(id, parsed.data.status));
  } catch (error) {
    return handleRouteError(error, "Không thể cập nhật đánh giá.");
  }
}
