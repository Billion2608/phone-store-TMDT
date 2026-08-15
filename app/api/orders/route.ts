import { successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { getOrders } from "@/services/order.service";

export async function GET() {
  try {
    const user = await requireAuth();
    return successResponse(await getOrders(user.id));
  } catch (error) {
    return handleRouteError(error, "Không thể tải đơn hàng.");
  }
}
