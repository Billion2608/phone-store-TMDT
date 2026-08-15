import { successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { getAdminUsers } from "@/services/admin.service";
export async function GET() {
  try {
    await requireAdmin();
    return successResponse(await getAdminUsers());
  } catch (error) {
    return handleRouteError(error, "Không thể tải người dùng.");
  }
}
