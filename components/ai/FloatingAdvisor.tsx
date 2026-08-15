"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface ProductItem {
  id: number | string;
  name: string;
  brand?: string;
  price?: number;
  description?: string;
  thumbnail?: string;
  slug?: string;
}

export interface AdvisorHistoryMessage {
  id?: string;
  role: "user" | "assistant" | string;
  content?: string;
  text?: string;
  products?: ProductItem[];
}

// Hàm giải mã tin nhắn an toàn (JSON hoặc Chuỗi văn bản thuần)
function parseAdvisorMessage(msg: AdvisorHistoryMessage) {
  let text = msg.text || msg.content || "";
  let products: ProductItem[] = msg.products || [];

  if (typeof text === "string") {
    const trimmed = text.trim();
    if (trimmed.startsWith("{") || trimmed.includes("PHONE_STORE_ADVISOR_V1")) {
      try {
        const cleanJsonStr = trimmed.replace(/^PHONE_STORE_ADVISOR_V1:\s*/i, "").trim();
        const parsed = JSON.parse(cleanJsonStr);

        text = parsed.message || parsed.reply || parsed.text || "Dưới đây là gợi ý dành cho bạn:";

        const rawRecs = parsed.recommendations || parsed.products || [];
        if (Array.isArray(rawRecs) && rawRecs.length > 0) {
          const parsedProducts: ProductItem[] = rawRecs.map((item: any) => ({
            id: item.productId || item.id,
            name: item.name || "Sản phẩm",
            price: item.price ? Number(item.price) : undefined,
            thumbnail: item.image || item.thumbnail || "/images/placeholder.webp",
            slug: item.slug || "",
          }));

          if (products.length === 0) {
            products = parsedProducts;
          }
        }
      } catch {
        // Nếu parse lỗi, giữ nguyên text dạng chuỗi thuần
      }
    }
  }

  return { text, products };
}

export function FloatingAdvisor() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [messages, setMessages] = useState<AdvisorHistoryMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống cuối khung chat khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Mở chat và tải lịch sử an toàn
  const openChat = useCallback(async () => {
    setOpen(true);
    if (loaded) return;
    setLoaded(true);

    try {
      const res = await fetch("/api/ai/recommend");
      if (!res.ok) return; // Bỏ qua nếu route không hỗ trợ GET lịch sử

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await res.json();
        const data = result.data || result;
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch {
      // Bỏ qua lỗi kết nối ban đầu để tránh làm phiền người dùng
    }
  }, [loaded]);

  // Lắng nghe sự kiện mở chat toàn cục
  useEffect(() => {
    window.addEventListener("open-phone-advisor", openChat);
    return () => window.removeEventListener("open-phone-advisor", openChat);
  }, [openChat]);

  // Hàm xử lý gửi tin nhắn
  async function submit(event?: FormEvent, suggestedPrompt?: string) {
    event?.preventDefault();
    const prompt = (suggestedPrompt ?? input).trim();
    if (prompt.length < 2 || loading) return;

    const userMsg: AdvisorHistoryMessage = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      text: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      if (!response.ok) {
        throw new Error("Trợ lý đang bận. Vui lòng thử lại sau.");
      }

      const result = await response.json();
      const payload = result.data || result;

      if (result.success === false) {
        throw new Error(
          payload.message || result.error || "Trợ lý gặp sự cố xử lý."
        );
      }

      const replyText =
        payload.text ||
        payload.reply ||
        payload.content ||
        "Dưới đây là các gợi ý cho bạn:";

      const botMsg: AdvisorHistoryMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyText,
        text: replyText,
        products: payload.products || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error("Lỗi gửi tin nhắn:", err);
      setError(err.message || "Không thể gửi tin nhắn lúc này.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Nút bấm mở Chatbot */}
      {!open && (
        <button
          onClick={openChat}
          className="flex items-center gap-2 rounded-full bg-amber-800 px-4 py-3 text-white shadow-lg transition hover:bg-amber-900"
        >
          <span className="text-xl">🤖</span>
          <span className="font-medium text-sm">Trợ lý AI</span>
        </button>
      )}

      {/* Cửa sổ Chatbot */}
      {open && (
        <div className="flex h-[520px] w-[360px] flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-amber-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="font-semibold text-sm">Trợ lý tư vấn mua sắm</h3>
                <p className="text-[11px] text-amber-200">
                  Gợi ý sản phẩm từ PhoneStore
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-white hover:bg-amber-800 transition"
            >
              ✕
            </button>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm">
            {messages.length === 0 && !loading && (
              <div className="text-center text-gray-500 my-6">
                <p className="mb-2">👋 Xin chào! Tôi có thể giúp gì cho bạn?</p>
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  {[
                    "iPhone 15 giá bao nhiêu?",
                    "Tìm máy dưới 10 triệu",
                    "Samsung pin trâu",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => submit(undefined, prompt)}
                      className="text-xs bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full hover:bg-amber-200 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const { text, products } = isUser
                ? { text: msg.text || msg.content || "", products: [] }
                : parseAdvisorMessage(msg);

              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                      isUser
                        ? "bg-amber-800 text-white rounded-br-none"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    {text}
                  </div>

                  {/* Danh sách thẻ sản phẩm gợi ý */}
                  {!isUser && products && products.length > 0 && (
                    <div className="mt-2 w-full space-y-2">
                      {products.map((p, pIdx) => (
                        <a
                          key={p.id || pIdx}
                          href={p.slug ? `/products/${p.slug}` : "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-amber-600 transition"
                        >
                          <img
                            src={p.thumbnail || "/images/placeholder.webp"}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-lg border flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "https://placehold.co/100x100?text=No+Image";
                            }}
                          />
                          <div className="flex-1 overflow-hidden">
                            <h4 className="font-semibold text-xs text-gray-900 truncate">
                              {p.name}
                            </h4>
                            <p className="text-xs text-amber-700 font-bold mt-0.5">
                              {p.price
                                ? `${Number(p.price).toLocaleString("vi-VN")} đ`
                                : "Liên hệ"}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Trạng thái đang tải */}
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs italic">
                <span className="animate-spin">⏳</span> Trợ lý đang suy nghĩ...
              </div>
            )}

            {/* Thông báo lỗi */}
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Ô nhập tin nhắn */}
          <form
            onSubmit={(e) => submit(e)}
            className="border-t bg-white p-3 flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi (VD: iPhone 15...)"
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-amber-800 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || input.trim().length < 2}
              className="rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-900 disabled:opacity-50"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
}