import { successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { getCart } from "@/services/cart.service";

export async function GET() {
  try {
    const user = await requireAuth();
    return successResponse(await getCart(user.id));
  } catch (error) {
    return handleRouteError(error, "Không thể tải giỏ hàng.");
  }
}
