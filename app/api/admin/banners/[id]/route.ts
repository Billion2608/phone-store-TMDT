import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { bannerSchema } from "@/lib/validations/admin";
import { deleteBanner, saveBanner } from "@/services/banner.service";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("Mã banner không hợp lệ.", 422);
    const parsed = bannerSchema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    return successResponse(await saveBanner(id, parsed.data));
  } catch (error) {
    return handleRouteError(error, "Không thể cập nhật banner.");
  }
}
export async function DELETE(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^\d+$/.test(id)) return errorResponse("Mã banner không hợp lệ.", 422);
    return successResponse(await deleteBanner(id));
  } catch (error) {
    return handleRouteError(error, "Không thể xóa banner.");
  }
}
