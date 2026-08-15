import { NextResponse } from "next/server";
import { processVnpayResult } from "@/services/order.service";
import { verifyVnpayParams } from "@/lib/vnpay";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const verified = verifyVnpayParams(url.searchParams);
  if (!verified.valid)
    return NextResponse.redirect(
      new URL("/orders?payment=invalid", url.origin),
    );
  const result = await processVnpayResult(verified.params);
  return NextResponse.redirect(
    new URL(
      result.orderId
        ? `/orders/${result.orderId}?payment=${result.success ? "success" : "failed"}`
        : "/orders?payment=failed",
      url.origin,
    ),
  );
}
