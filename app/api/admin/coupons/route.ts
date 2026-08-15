import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { couponSchema } from "@/lib/validations/admin";
import { getAdminCoupons, saveAdminCoupon } from "@/services/admin.service";
export async function GET() {
  try {
    await requireAdmin();
    return successResponse(await getAdminCoupons());
  } catch (error) {
    return handleRouteError(error, "Không thể tải coupon.");
  }
}
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = couponSchema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(await saveAdminCoupon(null, parsed.data), 201);
  } catch (error) {
    return handleRouteError(error, "Không thể tạo coupon.");
  }
}
