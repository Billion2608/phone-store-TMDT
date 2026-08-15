import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "sky",
}: {
  children: ReactNode;
  tone?: "sky" | "green" | "red" | "amber";
}) {
  const tones = {
    sky: "bg-sky-50 text-sky-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <span
      className={`inline-flex rounded-sm px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
