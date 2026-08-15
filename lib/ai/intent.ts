export type AdvisorIntent = {
  budget: number | null;
  category: "phone" | "accessory" | null;
  keywords: string[];
};

const needGroups: Array<[string[], string[]]> = [
  [
    ["game", "gaming", "chơi game", "hiệu năng", "mạnh"],
    ["game", "gaming", "chip", "cpu", "ram", "màn hình"],
  ],
  [
    ["pin", "pin lâu", "pin trâu"],
    ["pin", "dung lượng pin", "mah"],
  ],
  [
    ["camera", "chụp ảnh", "quay video"],
    ["camera", "chụp", "video"],
  ],
  [
    ["sạc nhanh", "sạc"],
    ["sạc", "công suất"],
  ],
  [
    ["màn hình", "xem phim"],
    ["màn hình", "oled", "amoled", "hz"],
  ],
  [
    ["tai nghe", "âm thanh", "chống ồn"],
    ["tai nghe", "âm thanh", "anc", "chống ồn"],
  ],
];

export function analyzeAdvisorIntent(prompt: string): AdvisorIntent {
  const normalized = prompt.toLocaleLowerCase("vi-VN");
  let budget: number | null = null;
  const million = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|tr\b)/i);
  const thousand = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:nghìn|ngàn|k\b)/i);
  const rawMoney = normalized.match(/(?:ngân sách|khoảng|tầm|có)\s*(\d{6,})/i);
  if (million)
    budget = Math.round(Number(million[1].replace(",", ".")) * 1_000_000);
  else if (thousand)
    budget = Math.round(Number(thousand[1].replace(",", ".")) * 1_000);
  else if (rawMoney) budget = Number(rawMoney[1]);

  const accessoryWords = [
    "phụ kiện",
    "tai nghe",
    "sạc",
    "cáp",
    "ốp",
    "kính",
    "pin dự phòng",
    "đồng hồ",
  ];
  const phoneWords = [
    "điện thoại",
    "smartphone",
    "máy",
    "iphone",
    "samsung",
    "xiaomi",
    "oppo",
  ];
  const category = accessoryWords.some((word) => normalized.includes(word))
    ? "accessory"
    : phoneWords.some((word) => normalized.includes(word))
      ? "phone"
      : null;
  const keywords = needGroups.flatMap(([triggers, matches]) =>
    triggers.some((word) => normalized.includes(word)) ? matches : [],
  );
  return { budget, category, keywords: [...new Set(keywords)] };
}
