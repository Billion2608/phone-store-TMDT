import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/api-response";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";
import { createPasswordReset } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const parsed = z
      .object({ email: z.email("Email không hợp lệ.") })
      .safeParse(await request.json());
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
        422,
      );
    const reset = await createPasswordReset(parsed.data.email);
    let developmentUrl: string | undefined;
    if (reset) {
      const origin =
        process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
      const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(reset.token)}`;
      const sent = await sendPasswordResetEmail(
        reset.email,
        reset.name,
        resetUrl,
      );
      if (!sent && process.env.NODE_ENV !== "production")
        developmentUrl = resetUrl;
    }
    return successResponse({
      message: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.",
      developmentUrl,
    });
  } catch {
    return errorResponse("Không thể xử lý yêu cầu lúc này.", 500);
  }
}
