import type { AdvisorRecommendation } from "@/types/ai";

type Candidate = Omit<AdvisorRecommendation, "reasons"> & {
  brand: string | null;
  category: string;
  specifications: string[];
  score: number;
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["message", "recommendations"],
  properties: {
    message: { type: "string" },
    recommendations: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["productId", "reasons"],
        properties: {
          productId: { type: "string" },
          reasons: {
            type: "array",
            minItems: 1,
            maxItems: 4,
            items: { type: "string" },
          },
        },
      },
    },
  },
};

function extractOutputText(response: {
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
}) {
  return response.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text")?.text;
}

export async function askOpenAI(
  prompt: string,
  candidates: Candidate[],
  history: Array<{ role: string; message: string }>,
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.OPENAI_MODEL || "gpt-5.6-terra";
  const shortlist = candidates.map(
    ({ productId, name, slug, price, brand, category, specifications }) => ({
      productId,
      name,
      slug,
      price,
      brand,
      category,
      specifications,
    }),
  );
  const recentConversation = history
    .slice(-6)
    .map((item) => `${item.role}: ${item.message}`)
    .join("\n");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "low" },
      instructions:
        "Bạn là chuyên viên tư vấn của PhoneStore. Chỉ đề xuất sản phẩm trong shortlist được cung cấp. Không bịa thông số, giá, tồn kho hoặc sản phẩm. Trả lời tiếng Việt súc tích, thực tế. Nêu rõ nếu lựa chọn chưa đáp ứng hoàn toàn nhu cầu.",
      input: `Lịch sử gần đây:\n${recentConversation || "Chưa có"}\n\nYêu cầu mới: ${prompt}\n\nShortlist từ database (${shortlist.length} sản phẩm):\n${JSON.stringify(shortlist)}`,
      text: {
        format: {
          type: "json_schema",
          name: "phone_store_recommendations",
          strict: true,
          schema: responseSchema,
        },
      },
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`OpenAI API returned ${response.status}`);
  const data = (await response.json()) as {
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  const outputText = extractOutputText(data);
  if (!outputText)
    throw new Error("OpenAI response did not contain output text");
  return JSON.parse(outputText) as {
    message: string;
    recommendations: Array<{ productId: string; reasons: string[] }>;
  };
}
