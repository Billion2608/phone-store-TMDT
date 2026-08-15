import { NextResponse } from "next/server";
import { verifyMomoResult } from "@/lib/momo";
import { processMomoResult } from "@/services/order.service";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  if (!verifyMomoResult(params))
    return NextResponse.redirect(
      new URL("/orders?payment=invalid", url.origin),
    );
  const result = await processMomoResult(params);
  return NextResponse.redirect(
    new URL(
      result.orderId
        ? `/orders/${result.orderId}?payment=${result.success ? "success" : "failed"}`
        : "/orders?payment=failed",
      url.origin,
    ),
  );
}
