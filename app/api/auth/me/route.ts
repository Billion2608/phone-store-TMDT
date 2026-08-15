import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Bạn chưa đăng nhập.", 401);
  }

  return successResponse(user);
}
