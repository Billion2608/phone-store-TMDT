import { createHmac, timingSafeEqual } from "node:crypto";

const zone = "Asia/Ho_Chi_Minh";
function formatDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}
function config() {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secret = process.env.VNPAY_HASH_SECRET;
  const url = process.env.VNPAY_URL;
  if (!tmnCode || !secret || !url)
    throw new Error("Thiếu cấu hình VNPay trên máy chủ.");
  return { tmnCode, secret, url };
}
function canonical(params: Record<string, string>) {
  // VNPay yêu cầu tham số được sắp xếp và mã hóa đúng thứ tự trước khi tạo hoặc kiểm tra checksum.
  return Object.keys(params)
    .sort()
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(params[key]).replace(/%20/g, "+")}`,
    )
    .join("&");
}
export function createVnpayUrl(input: {
  orderCode: string;
  amount: number;
  ipAddress: string;
  returnUrl: string;
}) {
  const { tmnCode, secret, url } = config();
  const now = new Date();
  const expire = new Date(now.getTime() + 15 * 60_000);
  const params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: String(Math.round(input.amount * 100)),
    vnp_CurrCode: "VND",
    vnp_TxnRef: input.orderCode,
    vnp_OrderInfo: `Thanh toan don hang ${input.orderCode}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: input.returnUrl,
    vnp_IpAddr: input.ipAddress || "127.0.0.1",
    vnp_CreateDate: formatDate(now),
    vnp_ExpireDate: formatDate(expire),
  };
  const query = canonical(params);
  const hash = createHmac("sha512", secret).update(query, "utf8").digest("hex");
  return `${url}?${query}&vnp_SecureHash=${hash}`;
}
export function verifyVnpayParams(searchParams: URLSearchParams) {
  const { secret } = config();
  const received = searchParams.get("vnp_SecureHash") ?? "";
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== "vnp_SecureHash" && key !== "vnp_SecureHashType")
      params[key] = value;
  });
  const expected = createHmac("sha512", secret)
    .update(canonical(params), "utf8")
    .digest("hex");
  const valid =
    received.length === expected.length &&
    timingSafeEqual(Buffer.from(received), Buffer.from(expected));
  return { valid, params };
}
