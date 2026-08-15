import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { bannerSchema } from "@/lib/validations/admin";
import { getAdminBanners, saveBanner } from "@/services/banner.service";
export async function GET() {
  try {
    await requireAdmin();
    return successResponse(await getAdminBanners());
  } catch (error) {
    return handleRouteError(error, "Không thể tải banner.");
  }
}
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = bannerSchema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(await saveBanner(null, parsed.data), 201);
  } catch (error) {
    return handleRouteError(error, "Không thể tạo banner.");
  }
}
