import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";

const PAYMENT_METHOD_LABELS = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  VNPAY: "VNPay",
  MOMO: "MoMo",
} as const;

export async function sendOrderConfirmationEmail(
  orderId: string,
  appUrl: string,
) {
  const order = await prisma.orders.findUnique({
    where: { id: BigInt(orderId) },
    include: {
      users: { select: { email: true } },
      order_items: {
        select: {
          product_name: true,
          variant_name: true,
          price: true,
          quantity: true,
          total_price: true,
        },
      },
    },
  });
  if (!order) return false;

  const formatMoney = (value: { toString(): string }) =>
    `${Number(value.toString()).toLocaleString("vi-VN")} đ`;
  const itemRows = order.order_items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e8dfd5">
            <strong>${escapeHtml(item.product_name)}</strong>
            ${item.variant_name ? `<br><span style="color:#6f625a">${escapeHtml(item.variant_name)}</span>` : ""}
          </td>
          <td style="padding:10px;text-align:center;border-bottom:1px solid #e8dfd5">${item.quantity}</td>
          <td style="padding:10px;text-align:right;border-bottom:1px solid #e8dfd5">${formatMoney(item.price)}</td>
          <td style="padding:10px;text-align:right;border-bottom:1px solid #e8dfd5">${formatMoney(item.total_price)}</td>
        </tr>`,
    )
    .join("");
  const orderUrl = `${appUrl.replace(/\/$/, "")}/orders/${order.id.toString()}`;

  return sendEmail({
    to: order.users.email,
    subject: `PhoneStore đã tiếp nhận đơn ${order.order_code}`,
    html: `
        <div style="max-width:680px;margin:auto;font-family:Arial,sans-serif;color:#2c221e;line-height:1.5">
          <h1 style="font-size:24px;color:#8c6d53">Đặt hàng thành công</h1>
          <p>Xin chào ${escapeHtml(order.receiver_name)},</p>
          <p>PhoneStore đã tiếp nhận đơn hàng <strong>${escapeHtml(order.order_code)}</strong>. Cửa hàng sẽ sớm xác nhận và cập nhật tiến trình giao hàng.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead style="background:#f5f2eb">
              <tr>
                <th style="padding:10px;text-align:left">Sản phẩm</th>
                <th style="padding:10px">Số lượng</th>
                <th style="padding:10px;text-align:right">Đơn giá</th>
                <th style="padding:10px;text-align:right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <p><strong>Tạm tính:</strong> ${formatMoney(order.subtotal)}</p>
          <p><strong>Giảm giá:</strong> ${formatMoney(order.discount_amount)}</p>
          <p><strong>Phí giao hàng:</strong> ${formatMoney(order.shipping_fee)}</p>
          <p style="font-size:18px"><strong>Tổng thanh toán: ${formatMoney(order.total_amount)}</strong></p>
          <p><strong>Hình thức thanh toán:</strong> ${PAYMENT_METHOD_LABELS[order.payment_method]}</p>
          <p><strong>Người nhận:</strong> ${escapeHtml(order.receiver_name)} · ${escapeHtml(order.receiver_phone)}</p>
          <p><strong>Địa chỉ:</strong> ${escapeHtml(order.shipping_address)}</p>
          <p style="margin-top:24px"><a href="${orderUrl}" style="display:inline-block;padding:11px 18px;border-radius:8px;background:#8c6d53;color:#fff;text-decoration:none">Xem chi tiết đơn hàng</a></p>
          <p style="margin-top:28px;color:#6f625a">Cảm ơn bạn đã mua sắm tại PhoneStore.</p>
        </div>`,
  });
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ] ?? character,
  );
}
