import { createHmac, timingSafeEqual } from "node:crypto";
function config() {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const endpoint =
    process.env.MOMO_ENDPOINT ||
    "https://test-payment.momo.vn/v2/gateway/api/create";
  if (!partnerCode || !accessKey || !secretKey)
    throw new Error("Thiếu cấu hình thanh toán MoMo trên máy chủ.");
  return { partnerCode, accessKey, secretKey, endpoint };
}
export function isMomoConfigured() {
  return Boolean(
    process.env.MOMO_PARTNER_CODE &&
      process.env.MOMO_ACCESS_KEY &&
      process.env.MOMO_SECRET_KEY,
  );
}
export async function createMomoPayment(input: {
  orderCode: string;
  amount: number;
  redirectUrl: string;
  ipnUrl: string;
}) {
  const { partnerCode, accessKey, secretKey, endpoint } = config();
  const requestId = `${input.orderCode}-${Date.now()}`;
  const orderInfo = `Thanh toan don hang ${input.orderCode}`;
  const extraData = "";
  const requestType = "captureWallet";
  const raw = `accessKey=${accessKey}&amount=${Math.round(input.amount)}&extraData=${extraData}&ipnUrl=${input.ipnUrl}&orderId=${input.orderCode}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${input.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = createHmac("sha256", secretKey).update(raw).digest("hex");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partnerCode,
      partnerName: "PhoneStore",
      storeId: "PhoneStore",
      requestId,
      amount: Math.round(input.amount),
      orderId: input.orderCode,
      orderInfo,
      redirectUrl: input.redirectUrl,
      ipnUrl: input.ipnUrl,
      lang: "vi",
      requestType,
      autoCapture: true,
      extraData,
      signature,
    }),
  });
  const result = (await response.json()) as {
    resultCode?: number;
    message?: string;
    payUrl?: string;
  };
  if (!response.ok || result.resultCode !== 0 || !result.payUrl)
    throw new Error(result.message || "Không thể tạo giao dịch MoMo.");
  return result.payUrl;
}
export function verifyMomoResult(params: Record<string, unknown>) {
  const { accessKey, secretKey, partnerCode } = config();
  if (String(params.partnerCode ?? "") !== partnerCode) return false;
  // Thứ tự trường là một phần của giao thức ký MoMo, không được tự ý thay đổi.
  const keys = [
    "amount",
    "extraData",
    "message",
    "orderId",
    "orderInfo",
    "orderType",
    "partnerCode",
    "payType",
    "requestId",
    "responseTime",
    "resultCode",
    "transId",
  ];
  const raw = `accessKey=${accessKey}&${keys.map((key) => `${key}=${String(params[key] ?? "")}`).join("&")}`;
  const expected = createHmac("sha256", secretKey).update(raw).digest("hex");
  const received = String(params.signature ?? "");
  return (
    received.length === expected.length &&
    timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  );
}
