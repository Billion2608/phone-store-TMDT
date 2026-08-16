import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth"; // Hoặc hàm lấy user của dự án bạn
import { prisma } from "@/lib/prisma"; // Hoặc db client của bạn

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    // 1. Nếu chưa đăng nhập -> Trả về lỗi 401 rõ ràng
    if (!user) {
      return NextResponse.json(
        { message: "Vui lòng đăng nhập để thêm vào giỏ hàng!" },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { message: "Thiếu thông tin sản phẩm!" },
        { status: 400 }
      );
    }

    // 2. Thêm hoặc cập nhật sản phẩm trong giỏ hàng DB
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: user.id,
        productId: productId,
        quantity: quantity,
      },
    });

    return NextResponse.json({ success: true, cartItem });
  } catch (error) {
    console.error("Lỗi thêm giỏ hàng:", error);
    return NextResponse.json(
      { message: "Không thể thêm vào giỏ hàng." },
      { status: 500 }
    );
  }
}
