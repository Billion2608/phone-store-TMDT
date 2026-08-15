import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// 1. Kiểm tra session sở hữu của người dùng
export async function getOwnedAdvisorSession(userId: string | null, sessionId: string) {
  try {
    const sessIdBigInt = BigInt(sessionId);
    const session = await prisma.ai_chat_sessions.findUnique({
      where: { id: sessIdBigInt },
    });

    if (!session) return null;
    if (userId && session.user_id && session.user_id !== BigInt(userId)) {
      return null;
    }
    return session.id.toString();
  } catch {
    return sessionId;
  }
}

// 2. Khởi tạo hoặc xác định session chat
export async function resolveAdvisorSession(userId: string | null, cookieSessionId?: string) {
  try {
    if (cookieSessionId) {
      const validId = await getOwnedAdvisorSession(userId, cookieSessionId);
      if (validId) return validId;
    }

    const newSession = await prisma.ai_chat_sessions.create({
      data: {
        user_id: userId ? BigInt(userId) : null,
      },
    });
    return newSession.id.toString();
  } catch {
    return cookieSessionId || "1";
  }
}

// 3. Lấy lịch sử đoạn chat
export async function getAdvisorHistory(sessionId: string) {
  try {
    const sessIdBigInt = BigInt(sessionId || "1");
    const messages = await prisma.ai_chat_messages.findMany({
      where: { session_id: sessIdBigInt },
      orderBy: { created_at: "asc" },
    });

    return messages.map((m) => ({
      id: m.id.toString(),
      role: m.role.toLowerCase(),
      text: m.message,
      content: m.message,
      products: [],
    }));
  } catch {
    return [];
  }
}

// 4. Xử lý gửi tin nhắn và tư vấn bằng Gemini AI
export async function sendAdvisorMessage(sessionId: string, userMessage: string) {
  const sessIdBigInt = BigInt(sessionId || "1");

  // Lưu tin nhắn của User vào DB
  try {
    await prisma.ai_chat_messages.create({
      data: {
        session_id: sessIdBigInt,
        role: "USER",
        message: userMessage,
      },
    });
  } catch (e) {
    console.warn("Chưa lưu được lịch sử user message:", e);
  }

  // Lấy danh sách sản phẩm từ bảng products
  let catalog: any[] = [];
  try {
    const productList = await prisma.products.findMany({
      where: { status: "ACTIVE" },
      include: {
        brands: true,
        product_variants: true,
      },
    });

    catalog = productList.map((p) => {
      const variant = p.product_variants?.[0];
      const rawPrice = variant ? Number(variant.sale_price || variant.price || 0) : 0;
      let img = p.thumbnail || "/images/placeholder.webp";
      if (!img.startsWith("/") && !img.startsWith("http")) img = `/${img}`;

      return {
        id: Number(p.id),
        name: p.name,
        brand: p.brands?.name || "Khác",
        price: rawPrice,
        description: p.short_description || p.description || p.name,
        thumbnail: img,
        slug: p.slug,
      };
    });
  } catch (dbError) {
    console.error("Lỗi lấy danh sách sản phẩm:", dbError);
  }

  // Gửi tới Gemini AI
  let replyText = "Dưới đây là các sản phẩm phù hợp với nhu cầu của bạn:";
  let recommendedProducts: any[] = [];

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Bạn là Trợ lý tư vấn điện thoại PhoneStore.
      Danh sách kho hàng hiện tại: ${JSON.stringify(catalog)}

      Yêu cầu khách hàng: "${userMessage}"

      Trả về DUY NHẤT một chuỗi JSON theo mẫu (không chứa markdown):
      {
        "reply": "Lời tư vấn ngắn gọn 1-2 câu",
        "recommended_ids": [danh_sách_id_dạng_số]
      }
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(rawText);

    if (parsed.reply) replyText = parsed.reply;
    const recIds = (parsed.recommended_ids || []).map((id: any) => Number(id));
    recommendedProducts = catalog.filter((p) => recIds.includes(p.id));
  } catch (aiError) {
    console.error("Lỗi AI Gemini:", aiError);
    recommendedProducts = catalog.slice(0, 2);
  }

  // Lưu phản hồi của AI vào DB
  try {
    await prisma.ai_chat_messages.create({
      data: {
        session_id: sessIdBigInt,
        role: "ASSISTANT",
        message: replyText,
      },
    });
  } catch (e) {
    console.warn("Chưa lưu được lịch sử AI message:", e);
  }

  return {
    id: Date.now().toString(),
    role: "assistant",
    text: replyText,
    reply: replyText,
    content: replyText,
    products: recommendedProducts,
  };
}