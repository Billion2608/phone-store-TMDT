import { errorResponse, successResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getProductBySlug } from "@/services/product.service";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/products/[id]">,
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return errorResponse("ID sản phẩm không hợp lệ.", 422);
  const record = await prisma.products.findUnique({
    where: { id: BigInt(id) },
    select: { slug: true },
  });
  if (!record) return errorResponse("Không tìm thấy sản phẩm.", 404);
  const product = await getProductBySlug(record.slug);
  return product
    ? successResponse(product)
    : errorResponse("Không tìm thấy sản phẩm.", 404);
}
