import { successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { getAdminReviews } from "@/services/admin.service";
export async function GET() {
  try {
    await requireAdmin();
    return successResponse(await getAdminReviews());
  } catch (error) {
    return handleRouteError(error, "Không thể tải đánh giá.");
  }
}
