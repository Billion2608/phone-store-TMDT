import { z } from "zod";

import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { handleRouteError } from "@/lib/route-error";
import { checkout } from "@/services/order.service";
import { createVnpayUrl } from "@/lib/vnpay";
import { createMomoPayment, isMomoConfigured } from "@/lib/momo";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation-email";

const schema = z.object({
  receiverName: z.string().trim().min(2).max(150),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+84|0)(?:\d[ .-]?){8,10}\d$/, "Số điện thoại không hợp lệ."),
  province: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100),
  ward: z.string().trim().min(2).max(100),
  address: z.string().trim().min(3).max(255),
  couponCode: z.string().trim().max(50).optional(),
  note: z.string().trim().max(1000).optional(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "VNPAY", "MOMO"]),
  saveAddress: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Thông tin thanh toán không hợp lệ.",
        422,
      );
    if (parsed.data.paymentMethod === "MOMO" && !isMomoConfigured())
      return errorResponse("Thanh toán MoMo chưa được cấu hình.", 503);
    const result = await checkout(user.id, parsed.data);
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    // Đơn hàng đã được commit nên lỗi dịch vụ email không được làm khách hàng đặt lại và tạo đơn trùng.
    try {
      await sendOrderConfirmationEmail(result.id, origin);
    } catch (error) {
      console.error("Không thể gửi email xác nhận đơn hàng:", error);
    }

    if (result.paymentMethod === "VNPAY") {
      const forwarded = request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim();
      const paymentUrl = createVnpayUrl({
        orderCode: result.orderCode,
        amount: result.totalAmount,
        ipAddress: forwarded || "127.0.0.1",
        returnUrl: `${origin}/api/payments/vnpay/return`,
      });
      return successResponse({ ...result, paymentUrl }, 201);
    }
    if (result.paymentMethod === "MOMO") {
      const paymentUrl = await createMomoPayment({
        orderCode: result.orderCode,
        amount: result.totalAmount,
        redirectUrl: `${origin}/api/payments/momo/return`,
        ipnUrl: `${origin}/api/payments/momo/ipn`,
      });
      return successResponse({ ...result, paymentUrl }, 201);
    }
    return successResponse(result, 201);
  } catch (error) {
    return handleRouteError(error, "Không thể tạo đơn hàng.");
  }
}
