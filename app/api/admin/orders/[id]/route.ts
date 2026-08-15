import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { getAdminOrder } from "@/services/admin.service";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("ID không hợp lệ.", 422);
    const data = await getAdminOrder(id);
    return data
      ? successResponse(data)
      : errorResponse("Không tìm thấy đơn hàng.", 404);
  } catch (error) {
    return handleRouteError(error, "Không thể tải đơn hàng.");
  }
}
