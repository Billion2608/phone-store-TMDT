import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

function cleanAndParseJSON(text: string) {
  try {
    const cleaned = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function resolveImageUrl(product: any): string {
  let rawImg = product?.thumbnail || product?.image || product?.product_variants?.[0]?.image;
  if (!rawImg) return "";
  if (typeof rawImg === "string" && rawImg.startsWith("[")) {
    try {
      const parsed = JSON.parse(rawImg);
      if (Array.isArray(parsed) && parsed.length > 0) rawImg = parsed[0];
    } catch {}
  }
  if (typeof rawImg !== "string") return "";
  const trimmed = rawImg.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

// BỘ LỌC REGEX BÓC TÁCH GIÁ TIỀN (TRIỆU, TR, CỦ, K)
function extractMaxPrice(text: string): number | null {
  const lower = text.toLowerCase();
  
  // Nhận diện dạng: 4 triệu, 4tr, 4 củ, 4.5 triệu, 4,5tr
  const trieuMatch = lower.match(/(?:dưới|tầm|mức|khoảng)?\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|củ)/i);
  if (trieuMatch) {
    const num = parseFloat(trieuMatch[1].replace(',', '.'));
    return Math.round(num * 1000000);
  }

  // Nhận diện dạng: 500k, 500 nghìn, 500 ngàn
  const kMatch = lower.match(/(?:dưới|tầm|mức|khoảng)?\s*(\d+)\s*(k|nghìn|ngàn)/i);
  if (kMatch) {
    const num = parseInt(kMatch[1], 10);
    return num * 1000;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const rawQuery = (message || "").trim();

    let parsedIntent: {
      intent: string;
      keywords: string[];
      maxPrice: number | null;
      sortBy: string;
    } = {
      intent: "SEARCH",
      keywords: [],
      maxPrice: extractMaxPrice(rawQuery),
      sortBy: "none"
    };

    const isCheapQuery = /rẻ|giá rẻ|nhất|dưới|tầm/i.test(rawQuery);

    // 1. PHÂN TÍCH TRUY VẤN BẰNG GEMINI AI
    if (apiKey) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const parsePrompt = `
        Phân tích truy vấn mua điện thoại và trả về duy nhất 1 JSON:
        {
          "intent": "CHEAPEST" | "COMPARE" | "SEARCH",
          "keywords": string[], 
          "maxPrice": number | null,
          "sortBy": "price_asc" | "none"
        }

        Quy tắc:
        - "maxPrice": Đổi giá tiền ra con số VND (Ví dụ: "dưới 4 triệu" -> 4000000, "dưới 5tr" -> 5000000, "10 củ" -> 10000000).
        - "keywords": Chỉ giữ lại hãng máy (samsung, iphone, vivo, oppo...) hoặc dòng máy. LOẠI BỎ cụm từ giá ("dưới 4 triệu", "giá rẻ", "máy").
        - "sortBy": Nếu có "dưới X triệu" hoặc "giá rẻ" thì chọn "price_asc".

        Câu hỏi: "${rawQuery}"
        `;

        const aiResult = await model.generateContent(parsePrompt);
        const parsed = cleanAndParseJSON(aiResult.response.text());
        if (parsed) {
          parsedIntent = {
            ...parsed,
            maxPrice: parsed.maxPrice || parsedIntent.maxPrice
          };
        }
      } catch (aiError) {
        console.warn("Lỗi AI, dùng Regex dự phòng:", aiError);
      }
    }

    // 2. XỬ LÝ TỪ KHÓA LỌC
    if (parsedIntent.maxPrice || isCheapQuery) {
      parsedIntent.sortBy = "price_asc";
    }

    if (!parsedIntent.keywords || parsedIntent.keywords.length === 0) {
      const cleanKw = rawQuery
        .replace(/(dưới|tầm|khoảng|giá|bao nhiêu|tìm|cho|xem|máy|điện thoại|rẻ nhất|giá rẻ|rẻ|so sánh|với|vs|\d+(?:[.,]\d+)?\s*(triệu|tr|củ|k|nghìn|ngàn))/gi, "")
        .trim();
      if (cleanKw) parsedIntent.keywords = [cleanKw];
    }

    // 3. TẠO ĐIỀU KIỆN TRUY VẤN PRISMA
    const whereCondition: any = { status: "ACTIVE" };

    // Lọc theo từ khóa hãng / tên sản phẩm nếu có
    const validKeywords = (parsedIntent.keywords || []).filter((k: string) => k && k.trim().length >= 2);
    if (validKeywords.length > 0) {
      whereCondition.OR = validKeywords.flatMap((kw: string) => [
        { name: { contains: kw } },
        { brands: { name: { contains: kw } } }
      ]);
    }

    // Lọc theo mức giá trần (maxPrice) trong các phiên bản sản phẩm
    if (parsedIntent.maxPrice && parsedIntent.maxPrice > 0) {
      whereCondition.product_variants = {
        some: {
          OR: [
            { sale_price: { lte: parsedIntent.maxPrice, gt: 0 } },
            { price: { lte: parsedIntent.maxPrice } }
          ]
        }
      };
    }

    let products = await prisma.products.findMany({
      where: whereCondition,
      include: {
        product_variants: { orderBy: { price: "asc" } }
      },
      take: 20
    });

    // Sắp xếp giá từ thấp đến cao
    if (parsedIntent.sortBy === "price_asc" || parsedIntent.maxPrice || isCheapQuery) {
      products.sort((a, b) => {
        const priceA = Number(a.product_variants[0]?.sale_price || a.product_variants[0]?.price || Infinity);
        const priceB = Number(b.product_variants[0]?.sale_price || b.product_variants[0]?.price || Infinity);
        return priceA - priceB;
      });
    }

    // 4. XỬ LÝ KHÔNG TÌM THẤY SẢN PHẨM PHÙ HỢP GIÁ
    let customText = "";
    if (products.length === 0) {
      if (parsedIntent.maxPrice) {
        customText = `Rất tiếc, PhoneStore hiện chưa có sản phẩm nào dưới ${parsedIntent.maxPrice.toLocaleString("vi-VN")} đ. Bạn có thể tham khảo các mẫu máy giá tốt nhất hiện tại:`;
      }
      
      // Lấy các sản phẩm có giá thấp nhất cửa hàng làm gợi ý
      products = await prisma.products.findMany({
        where: { status: "ACTIVE" },
        include: { product_variants: { orderBy: { price: "asc" }, take: 1 } },
        take: 3
      });
      products.sort((a, b) => {
        const priceA = Number(a.product_variants[0]?.sale_price || a.product_variants[0]?.price || Infinity);
        const priceB = Number(b.product_variants[0]?.sale_price || b.product_variants[0]?.price || Infinity);
        return priceA - priceB;
      });
    }

    // 5. ĐỊNH DẠNG RESPONSE
    const formattedProducts = products.slice(0, 3).map((p) => {
      const variant = p.product_variants[0];
      return {
        id: Number(p.id),
        name: p.name,
        price: Number(variant?.sale_price || variant?.price || 0),
        slug: p.slug,
        thumbnail: resolveImageUrl(p)
      };
    });

    let replyText = customText || `Dưới đây là thông tin sản phẩm phù hợp với tìm kiếm của bạn:`;
    if (!customText && formattedProducts.length > 0) {
      if (parsedIntent.maxPrice) {
        replyText = `Dưới đây là các mẫu máy có giá dưới ${parsedIntent.maxPrice.toLocaleString("vi-VN")} đ tại PhoneStore:`;
      } else if (isCheapQuery) {
        replyText = `Dưới đây là các mẫu máy giá rẻ nhất hiện có tại PhoneStore:`;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        text: replyText,
        products: formattedProducts
      }
    });

  } catch (error: any) {
    console.error("Lỗi Server:", error);
    return NextResponse.json({
      success: true,
      data: {
        text: "Dưới đây là các sản phẩm nổi bật tại cửa hàng:",
        products: []
      }
    });
  }
}