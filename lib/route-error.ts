import { AuthenticationError } from "@/lib/auth";
import { errorResponse } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export class BusinessError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "BusinessError";
    this.status = status;
  }
}

export function handleRouteError(error: unknown, fallback: string) {
  if (error instanceof AuthenticationError || error instanceof BusinessError) {
    return errorResponse(error.message, error.status);
  }
  if (error instanceof SyntaxError)
    return errorResponse("Nội dung yêu cầu không hợp lệ.", 400);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002")
      return errorResponse("Dữ liệu bị trùng với bản ghi hiện có.", 409);
    if (error.code === "P2003")
      return errorResponse(
        "Không thể thay đổi vì dữ liệu đang được sử dụng.",
        409,
      );
    if (error.code === "P2025")
      return errorResponse("Không tìm thấy dữ liệu cần cập nhật.", 404);
  }
  return errorResponse(fallback, 500);
}
