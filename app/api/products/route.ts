import { z } from "zod";

import { errorResponse, successResponse } from "@/lib/api-response";
import { getProducts } from "@/services/product.service";

const querySchema = z
  .object({
    search: z.string().trim().max(255).optional(),
    category: z.string().trim().max(150).optional(),
    brand: z.string().trim().max(120).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z
      .enum(["newest", "price-asc", "price-desc", "best-selling"])
      .default("newest"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(48).default(12),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    { message: "Khoảng giá không hợp lệ." },
  );

export async function GET(request: Request) {
  const params = Object.fromEntries(
    new URL(request.url).searchParams.entries(),
  );
  const parsed = querySchema.safeParse(params);
  if (!parsed.success)
    return errorResponse(
      parsed.error.issues[0]?.message ?? "Tham số không hợp lệ.",
      422,
    );
  try {
    return successResponse(await getProducts(parsed.data));
  } catch {
    return errorResponse("Không thể tải danh sách sản phẩm.", 500);
  }
}
