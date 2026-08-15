import { NextResponse } from "next/server";
import { processVnpayResult } from "@/services/order.service";
import { verifyVnpayParams } from "@/lib/vnpay";
export async function GET(request: Request) {
  try {
    const verified = verifyVnpayParams(new URL(request.url).searchParams);
    if (!verified.valid)
      return NextResponse.json({ RspCode: "97", Message: "Invalid Checksum" });
    const result = await processVnpayResult(verified.params);
    return NextResponse.json({ RspCode: result.code, Message: result.message });
  } catch {
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" });
  }
}
