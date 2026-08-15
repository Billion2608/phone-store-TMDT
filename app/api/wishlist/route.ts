import { z } from "zod";

import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import {
  addWishlist,
  getWishlist,
  removeWishlist,
} from "@/services/wishlist.service";

const schema = z.object({ productId: z.string().regex(/^\d+$/) });

export async function GET() {
  try {
    const user = await requireAuth();
    return successResponse(await getWishlist(user.id));
  } catch (error) {
    return handleRouteError(error, "Không thể tải danh sách yêu thích.");
  }
}
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return errorResponse("ID sản phẩm không hợp lệ.", 422);
    return successResponse(
      await addWishlist(user.id, parsed.data.productId),
      201,
    );
  } catch (error) {
    return handleRouteError(error, "Không thể thêm yêu thích.");
  }
}
export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return errorResponse("ID sản phẩm không hợp lệ.", 422);
    return successResponse(
      await removeWishlist(user.id, parsed.data.productId),
    );
  } catch (error) {
    return handleRouteError(error, "Không thể xóa yêu thích.");
  }
}
