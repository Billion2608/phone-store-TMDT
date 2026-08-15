import { z } from "zod";

import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { addCartItem } from "@/services/cart.service";

const schema = z.object({
  variantId: z.string().regex(/^\d+$/),
  quantity: z.number().int().min(1).max(99),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(
      await addCartItem(user.id, parsed.data.variantId, parsed.data.quantity),
      201,
    );
  } catch (error) {
    return handleRouteError(error, "Không thể thêm vào giỏ hàng.");
  }
}
