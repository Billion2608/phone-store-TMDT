import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";

export const runtime = "nodejs";
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = await request.formData();
    const files = data
      .getAll("files")
      .filter((value): value is File => value instanceof File);
    if (!files.length)
      return errorResponse("Vui lòng chọn ít nhất một ảnh.", 422);
    if (files.length > 10)
      return errorResponse("Chỉ được tải tối đa 10 ảnh mỗi lần.", 422);
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });
    const urls: string[] = [];
    for (const file of files) {
      const extension = allowedTypes.get(file.type);
      if (!extension)
        return errorResponse("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.", 422);
      if (file.size > 5 * 1024 * 1024)
        return errorResponse("Mỗi ảnh không được vượt quá 5MB.", 422);
      const filename = `${Date.now()}-${randomUUID()}.${extension}`;
      await writeFile(
        path.join(uploadDir, filename),
        Buffer.from(await file.arrayBuffer()),
      );
      urls.push(`/uploads/products/${filename}`);
    }
    return successResponse({ urls }, 201);
  } catch (error) {
    return handleRouteError(error, "Không thể tải ảnh lên.");
  }
}
