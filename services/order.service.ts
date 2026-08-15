import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { BusinessError } from "@/lib/route-error";
import type {
  CheckoutInput,
  OrderDetail,
  OrderListItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/order";

function orderCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `PS${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function calculateDiscount(
  subtotal: Prisma.Decimal,
  coupon: {
    discount_type: "PERCENT" | "FIXED";
    discount_value: Prisma.Decimal;
    max_discount_amount: Prisma.Decimal | null;
  },
) {
  let discount =
    coupon.discount_type === "PERCENT"
      ? subtotal.mul(coupon.discount_value).div(100)
      : coupon.discount_value;
  if (coupon.max_discount_amount && discount.gt(coupon.max_discount_amount))
    discount = coupon.max_discount_amount;
  if (discount.gt(subtotal)) discount = subtotal;
  return discount.toDecimalPlaces(0);
}

export async function checkout(userId: string, input: CheckoutInput) {
  if (
    !(["COD", "VNPAY", "MOMO"] as const).includes(
      input.paymentMethod as "COD" | "VNPAY" | "MOMO",
    )
  )
    throw new BusinessError("Phương thức thanh toán chưa được hỗ trợ.", 422);
  const userIdValue = BigInt(userId);

  // Toàn bộ giá, khuyến mãi và tồn kho được đọc lại trong transaction; không tin dữ liệu giá từ frontend.
  return prisma.$transaction(
    async (tx) => {
      const cart = await tx.carts.findUnique({
        where: { user_id: userIdValue },
        include: {
          cart_items: {
            include: {
              product_variants: {
                include: {
                  products: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      thumbnail: true,
                      status: true,
                    },
                  },
                  variant_attribute_values: {
                    include: {
                      attribute_values: { include: { attributes: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!cart?.cart_items.length)
        throw new BusinessError("Giỏ hàng đang trống.", 409);

      let subtotal = new Prisma.Decimal(0);
      const snapshots = cart.cart_items.map((item) => {
        const variant = item.product_variants;
        if (!variant.status || variant.products.status !== "ACTIVE")
          throw new BusinessError(
            `${variant.products.name} hiện không còn được bán.`,
            409,
          );
        if (item.quantity <= 0 || item.quantity > variant.stock_quantity)
          throw new BusinessError(
            `${variant.products.name} không đủ tồn kho.`,
            409,
          );
        const price = variant.sale_price ?? variant.price;
        const total = price.mul(item.quantity);
        subtotal = subtotal.add(total);
        return {
          variant,
          quantity: item.quantity,
          price,
          total,
          variantName:
            variant.variant_attribute_values
              .map(
                (entry) =>
                  `${entry.attribute_values.attributes.name}: ${entry.attribute_values.value}`,
              )
              .join(" · ") || null,
        };
      });

      const now = new Date();
      let coupon: Awaited<ReturnType<typeof tx.coupons.findUnique>> = null;
      let discount = new Prisma.Decimal(0);
      if (input.couponCode) {
        coupon = await tx.coupons.findUnique({
          where: { code: input.couponCode.trim().toUpperCase() },
        });
        if (!coupon || !coupon.status)
          throw new BusinessError("Mã giảm giá không hợp lệ.", 422);
        if (coupon.start_date && coupon.start_date > now)
          throw new BusinessError("Mã giảm giá chưa bắt đầu.", 422);
        if (coupon.end_date && coupon.end_date < now)
          throw new BusinessError("Mã giảm giá đã hết hạn.", 422);
        if (
          coupon.usage_limit !== null &&
          coupon.used_count >= coupon.usage_limit
        )
          throw new BusinessError("Mã giảm giá đã hết lượt sử dụng.", 422);
        if (coupon.min_order_amount && subtotal.lt(coupon.min_order_amount))
          throw new BusinessError(
            `Đơn hàng chưa đạt giá trị tối thiểu ${Number(coupon.min_order_amount).toLocaleString("vi-VN")}đ.`,
            422,
          );
        discount = calculateDiscount(subtotal, coupon);
      }

      const shippingFee = subtotal.gte(FREE_SHIPPING_THRESHOLD)
        ? new Prisma.Decimal(0)
        : new Prisma.Decimal(STANDARD_SHIPPING_FEE);
      const totalAmount = subtotal.sub(discount).add(shippingFee);
      const shippingAddress = [
        input.address,
        input.ward,
        input.district,
        input.province,
      ]
        .filter(Boolean)
        .join(", ");

      const order = await tx.orders.create({
        data: {
          order_code: orderCode(),
          user_id: userIdValue,
          coupon_id: coupon?.id,
          receiver_name: input.receiverName,
          receiver_phone: input.phone,
          shipping_address: shippingAddress,
          subtotal,
          discount_amount: discount,
          shipping_fee: shippingFee,
          total_amount: totalAmount,
          payment_method: input.paymentMethod,
          payment_status: "UNPAID",
          status: "PENDING",
          note: input.note || null,
        },
        select: { id: true, order_code: true, total_amount: true },
      });

      await tx.order_items.createMany({
        data: snapshots.map(
          ({ variant, quantity, price }) => ({
            order_id: order.id,
            variant_id: variant.id,
            price,
            quantity,
          }),
        ),
      });

      for (const snapshot of snapshots) {
        const updated = await tx.product_variants.updateMany({
          where: {
            id: snapshot.variant.id,
            status: true,
            stock_quantity: { gte: snapshot.quantity },
          },
          data: { stock_quantity: { decrement: snapshot.quantity } },
        });
        if (updated.count !== 1)
          throw new BusinessError(
            `${snapshot.variant.products.name} vừa thay đổi tồn kho. Vui lòng thử lại.`,
            409,
          );
        await tx.products.update({
          where: { id: snapshot.variant.products.id },
          data: { sold_count: { increment: snapshot.quantity } },
        });
      }

      await tx.payments.create({
        data: {
          order_id: order.id,
          payment_method: input.paymentMethod,
          amount: totalAmount,
          status: "PENDING",
        },
      });
      await tx.order_status_history.create({
        data: {
          order_id: order.id,
          old_status: null,
          new_status: "PENDING",
          changed_by: userIdValue,
          note: "Đơn hàng được tạo.",
        },
      });

      if (coupon) {
        const couponUpdated = await tx.coupons.updateMany({
          where: {
            id: coupon.id,
            ...(coupon.usage_limit !== null
              ? { used_count: { lt: coupon.usage_limit } }
              : {}),
          },
          data: { used_count: { increment: 1 } },
        });
        if (couponUpdated.count !== 1)
          throw new BusinessError("Mã giảm giá vừa hết lượt sử dụng.", 409);
        await tx.coupon_usages.create({
          data: {
            coupon_id: coupon.id,
            user_id: userIdValue,
            order_id: order.id,
          },
        });
      }

      await tx.cart_items.deleteMany({ where: { cart_id: cart.id } });
      if (input.saveAddress) {
        await tx.addresses.updateMany({
          where: { user_id: userIdValue },
          data: { is_default: false },
        });
        await tx.addresses.create({
          data: {
            user_id: userIdValue,
            receiver_name: input.receiverName,
            phone: input.phone,
            address: shippingAddress,
            is_default: true,
          },
        });
      }
      return {
        id: order.id.toString(),
        orderCode: order.order_code,
        totalAmount: Number(order.total_amount),
        paymentMethod: input.paymentMethod,
      };
    },
    { isolationLevel: "Serializable", maxWait: 5_000, timeout: 15_000 },
  );
}

export async function getOrders(userId: string): Promise<OrderListItem[]> {
  const orders = await prisma.orders.findMany({
    where: { user_id: BigInt(userId) },
    orderBy: { created_at: "desc" },
    include: { order_items: { select: { quantity: true } } },
  });
  return orders.map((order) => ({
    id: order.id.toString(),
    orderCode: order.order_code,
    createdAt: order.created_at.toISOString(),
    totalAmount: Number(order.total_amount),
    status: order.status as OrderStatus,
    paymentStatus: order.payment_status as PaymentStatus,
    paymentMethod: order.payment_method as PaymentMethod,
    itemCount: order.order_items.reduce((sum, item) => sum + item.quantity, 0),
  }));
}

export async function getDefaultAddress(userId: string) {
  const address = await prisma.addresses.findFirst({
    where: { user_id: BigInt(userId) },
    orderBy: [{ is_default: "desc" }, { updated_at: "desc" }],
  });
  return address
    ? {
        receiverName: address.receiver_name,
        phone: address.phone,
        province: "",
        district: "",
        ward: "",
        address: address.address,
      }
    : null;
}

export async function cancelCustomerOrder(
  userId: string,
  orderId: string,
  reason?: string,
) {
  // Hủy đơn và hoàn kho phải thành công hoặc thất bại cùng nhau để tránh sai lệch tồn kho.
  return prisma.$transaction(
    async (tx) => {
      const order = await tx.orders.findFirst({
        where: { id: BigInt(orderId), user_id: BigInt(userId) },
        select: {
          id: true,
          status: true,
          coupon_id: true,
          order_items: {
            select: {
              variant_id: true,
              quantity: true,
              product_variants: { select: { product_id: true } },
            },
          },
        },
      });
      if (!order) throw new BusinessError("Không tìm thấy đơn hàng.", 404);
      if (order.status !== "PENDING")
        throw new BusinessError(
          "Chỉ có thể hủy đơn hàng đang chờ xác nhận.",
          409,
        );
      const cancelledReason = reason?.trim() || "Khách hàng chủ động hủy đơn.";
      await tx.orders.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          cancelled_at: new Date(),
          cancelled_reason: cancelledReason,
        },
      });
      for (const item of order.order_items) {
        await tx.product_variants.update({
          where: { id: item.variant_id },
          data: { stock_quantity: { increment: item.quantity } },
        });
        await tx.products.update({
          where: { id: item.product_variants.product_id },
          data: { sold_count: { decrement: item.quantity } },
        });
      }
      if (order.coupon_id) {
        await tx.coupon_usages.deleteMany({
          where: { order_id: order.id, user_id: BigInt(userId) },
        });
        await tx.coupons.updateMany({
          where: { id: order.coupon_id, used_count: { gt: 0 } },
          data: { used_count: { decrement: 1 } },
        });
      }
      await tx.order_status_history.create({
        data: {
          order_id: order.id,
          old_status: "PENDING",
          new_status: "CANCELLED",
          changed_by: BigInt(userId),
          note: cancelledReason,
        },
      });
      return { id: order.id.toString(), status: "CANCELLED" as const };
    },
    { isolationLevel: "Serializable" },
  );
}

export async function processVnpayResult(params: Record<string, string>) {
  const orderCode = params.vnp_TxnRef;
  const success =
    params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00";
  // Callback có thể được cổng thanh toán gửi lại nhiều lần, vì vậy trạng thái SUCCESS được xử lý bất biến.
  return prisma.$transaction(async (tx) => {
    const order = await tx.orders.findUnique({
      where: { order_code: orderCode },
      include: {
        payments: {
          where: { payment_method: "VNPAY" },
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
    });
    if (!order)
      return {
        code: "01",
        message: "Order not found",
        orderId: null,
        success: false,
      };
    if (
      String(Math.round(Number(order.total_amount) * 100)) !== params.vnp_Amount
    )
      return {
        code: "04",
        message: "Invalid amount",
        orderId: order.id.toString(),
        success: false,
      };
    const payment = order.payments[0];
    if (!payment)
      return {
        code: "01",
        message: "Payment not found",
        orderId: order.id.toString(),
        success: false,
      };
    if (payment.status === "SUCCESS")
      return {
        code: "02",
        message: "Order already confirmed",
        orderId: order.id.toString(),
        success: true,
      };
    await tx.payments.update({
      where: { id: payment.id },
      data: {
        status: success ? "SUCCESS" : "FAILED",
        transaction_code:
          params.vnp_TransactionNo || params.vnp_BankTranNo || null,
        payment_response: JSON.stringify(params),
        paid_at: success ? new Date() : null,
      },
    });
    await tx.orders.update({
      where: { id: order.id },
      data: { payment_status: success ? "PAID" : "FAILED" },
    });
    await tx.order_status_history.create({
      data: {
        order_id: order.id,
        old_status: order.status,
        new_status: order.status,
        note: success
          ? "Thanh toán VNPay thành công."
          : `Thanh toán VNPay không thành công (${params.vnp_ResponseCode || "unknown"}).`,
      },
    });
    return {
      code: "00",
      message: "Confirm Success",
      orderId: order.id.toString(),
      success,
    };
  });
}

export async function processMomoResult(params: Record<string, unknown>) {
  const orderCode = String(params.orderId ?? "");
  const success = Number(params.resultCode) === 0;
  // Luôn đối chiếu số tiền MoMo với tổng tiền trong database trước khi ghi nhận thanh toán.
  return prisma.$transaction(async (tx) => {
    const order = await tx.orders.findUnique({
      where: { order_code: orderCode },
      include: {
        payments: {
          where: { payment_method: "MOMO" },
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
    });
    if (!order) return { orderId: null, success: false };
    if (Math.round(Number(order.total_amount)) !== Number(params.amount))
      return { orderId: order.id.toString(), success: false };
    const payment = order.payments[0];
    if (!payment) return { orderId: order.id.toString(), success: false };
    if (payment.status === "SUCCESS")
      return { orderId: order.id.toString(), success: true };
    await tx.payments.update({
      where: { id: payment.id },
      data: {
        status: success ? "SUCCESS" : "FAILED",
        transaction_code: params.transId ? String(params.transId) : null,
        payment_response: JSON.stringify(params),
        paid_at: success ? new Date() : null,
      },
    });
    await tx.orders.update({
      where: { id: order.id },
      data: { payment_status: success ? "PAID" : "FAILED" },
    });
    await tx.order_status_history.create({
      data: {
        order_id: order.id,
        old_status: order.status,
        new_status: order.status,
        note: success
          ? "Thanh toán MoMo thành công."
          : `Thanh toán MoMo không thành công (${String(params.resultCode ?? "")}).`,
      },
    });
    return { orderId: order.id.toString(), success };
  });
}

export async function getOrderDetail(
  userId: string,
  orderId: string,
): Promise<OrderDetail | null> {
  const order = await prisma.orders.findFirst({
    where: { id: BigInt(orderId), user_id: BigInt(userId) },
    include: {
      order_items: {
        include: {
          product_variants: {
            include: { products: { select: { id: true, name: true, slug: true, thumbnail: true } }, variant_attribute_values: { include: { attribute_values: { include: { attributes: true } } } } },
          },
          reviews: { where: { user_id: BigInt(userId) }, select: { id: true } },
        },
      },
      payments: { orderBy: { created_at: "desc" }, take: 1 },
      order_status_history: { orderBy: { created_at: "asc" } },
    },
  });
  if (!order) return null;
  const itemCount = order.order_items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const payment = order.payments[0];
  return {
    id: order.id.toString(),
    orderCode: order.order_code,
    createdAt: order.created_at.toISOString(),
    totalAmount: Number(order.total_amount),
    status: order.status as OrderStatus,
    paymentStatus: order.payment_status as PaymentStatus,
    paymentMethod: order.payment_method as PaymentMethod,
    itemCount,
    receiverName: order.receiver_name,
    receiverPhone: order.receiver_phone,
    shippingAddress: order.shipping_address,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discount_amount),
    shippingFee: Number(order.shipping_fee),
    note: order.note,
    cancelledReason: order.cancelled_reason,
    items: order.order_items.map((item) => {
      const variant = item.product_variants;
      const variantName = variant.variant_attribute_values
        .map(
          (entry) =>
            `${entry.attribute_values.attributes.name}: ${entry.attribute_values.value}`,
        )
        .join(" · ") || null;

      return {
        id: item.id.toString(),
        variantId: item.variant_id.toString(),
        productId: variant.products.id.toString(),
        productName: variant.products.name,
        productSlug: variant.products.slug,
        variantName,
        sku: variant.sku,
        image: variant.image ?? variant.products.thumbnail,
        price: Number(item.price),
        quantity: item.quantity,
        totalPrice: Number(item.price) * item.quantity,
        canReview: order.status === "COMPLETED" && item.reviews.length === 0,
        reviewId: item.reviews[0]?.id.toString() ?? null,
      };
    }),
    payment: payment
      ? {
          method: payment.payment_method as PaymentMethod,
          status: payment.status,
          amount: Number(payment.amount),
        }
      : null,
    timeline: order.order_status_history.map((entry) => ({
      status: entry.new_status,
      note: entry.note,
      createdAt: entry.created_at.toISOString(),
    })),
  };
}
