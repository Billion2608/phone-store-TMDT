import { NextResponse } from "next/server";
import { verifyMomoResult } from "@/lib/momo";
import { processMomoResult } from "@/services/order.service";
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (!verifyMomoResult(body))
      return NextResponse.json(
        { message: "Chữ ký không hợp lệ" },
        { status: 400 },
      );
    await processMomoResult(body);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: "Không thể xử lý kết quả" },
      { status: 500 },
    );
  }
}
