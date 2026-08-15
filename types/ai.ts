export type AdvisorMode = "ai" | "rule-based";

export type AdvisorRecommendation = {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  reasons: string[];
};

export type AdvisorReply = {
  sessionId: string;
  mode: AdvisorMode;
  message: string;
  recommendations: AdvisorRecommendation[];
};

export type AdvisorHistoryMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  text: string;
  mode?: AdvisorMode;
  recommendations?: AdvisorRecommendation[];
};
