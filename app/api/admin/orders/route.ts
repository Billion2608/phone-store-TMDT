import { successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { getAdminOrders } from "@/services/admin.service";
import type { OrderStatus } from "@/types/order";
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const params = new URL(request.url).searchParams;
    const status = params.get("status") as OrderStatus | null;
    const valid =
      status &&
      ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"].includes(
        status,
      )
        ? status
        : undefined;
    return successResponse(
      await getAdminOrders({
        status: valid,
        search: params.get("search") || undefined,
      }),
    );
  } catch (error) {
    return handleRouteError(error, "Không thể tải đơn hàng.");
  }
}
