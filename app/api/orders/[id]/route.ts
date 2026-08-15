import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { cancelCustomerOrder, getOrderDetail } from "@/services/order.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    if (!/^\d+$/.test(id))
      return errorResponse("ID đơn hàng không hợp lệ.", 422);
    const order = await getOrderDetail(user.id, id);
    return order
      ? successResponse(order)
      : errorResponse("Không tìm thấy đơn hàng.", 404);
  } catch (error) {
    return handleRouteError(error, "Không thể tải chi tiết đơn hàng.");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    if (!/^\d+$/.test(id))
      return errorResponse("ID đơn hàng không hợp lệ.", 422);
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      reason?: string;
    };
    if (body.action !== "cancel")
      return errorResponse("Thao tác không hợp lệ.", 422);
    return successResponse(await cancelCustomerOrder(user.id, id, body.reason));
  } catch (error) {
    return handleRouteError(error, "Không thể hủy đơn hàng.");
  }
}
