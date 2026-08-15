import { z } from "zod";

import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { removeCartItem, updateCartItem } from "@/services/cart.service";

const schema = z.object({ quantity: z.number().int().min(1).max(99) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("ID không hợp lệ.", 422);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(
      await updateCartItem(user.id, id, parsed.data.quantity),
    );
  } catch (error) {
    return handleRouteError(error, "Không thể cập nhật giỏ hàng.");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("ID không hợp lệ.", 422);
    return successResponse(await removeCartItem(user.id, id));
  } catch (error) {
    return handleRouteError(error, "Không thể xóa sản phẩm.");
  }
}
