import { errorResponse, successResponse } from "@/lib/api-response";

const baseUrl = "https://provinces.open-api.vn/api/v1";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const type = params.get("type") ?? "provinces";
    const code = params.get("code") ?? "";
    let endpoint = `${baseUrl}/p/`;

    if (type === "districts" && /^\d+$/.test(code)) {
      endpoint = `${baseUrl}/p/${code}?depth=2`;
    } else if (type === "wards" && /^\d+$/.test(code)) {
      endpoint = `${baseUrl}/d/${code}?depth=2`;
    } else if (type !== "provinces") {
      return errorResponse("Yêu cầu địa giới không hợp lệ.", 422);
    }

    // Dữ liệu địa giới ít thay đổi nên cache một ngày để giảm phụ thuộc vào API bên ngoài.
    const response = await fetch(endpoint, { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error("API địa giới không phản hồi.");
    const data = await response.json();

    if (type === "districts") return successResponse(data.districts ?? []);
    if (type === "wards") return successResponse(data.wards ?? []);
    return successResponse(data);
  } catch {
    return errorResponse("Không thể tải dữ liệu tỉnh thành.", 502);
  }
}
