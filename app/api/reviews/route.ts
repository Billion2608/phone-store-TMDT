import { z } from "zod";

import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { createReview } from "@/services/review.service";

const schema = z.object({
  orderItemId: z.string().regex(/^\d+$/),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(255).optional(),
  comment: z.string().trim().min(3).max(3000),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Đánh giá không hợp lệ.",
        422,
      );
    return successResponse(await createReview(user.id, parsed.data), 201);
  } catch (error) {
    return handleRouteError(error, "Không thể gửi đánh giá.");
  }
}
