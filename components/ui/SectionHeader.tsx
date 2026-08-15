import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
export function SectionHeader({
  title,
  icon,
  href,
  tabs = [],
}: {
  title: string;
  icon?: ReactNode;
  href?: string;
  tabs?: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="mb-4 flex min-h-10 flex-wrap items-end border-b border-[#e7dfd5]">
      <h2 className="flex items-center gap-2 border-b-2 border-[var(--retail-accent)] pb-2 text-lg font-bold text-[#2c221e] sm:text-xl">
        <span className="text-[var(--retail-accent)]">{icon}</span>
        {title}
      </h2>
      <div className="ml-auto flex flex-wrap items-center">
        {tabs.map((tab) => (
          <Link
            className="px-3 py-2 text-xs font-semibold text-[#6f625b] hover:text-[var(--retail-accent)] sm:text-sm"
            href={tab.href}
            key={tab.label}
          >
            {tab.label}
          </Link>
        ))}
        {href ? (
          <Link
            className="flex items-center gap-1 py-2 pl-3 text-xs font-semibold text-[var(--retail-accent)]"
            href={href}
          >
            Xem tất cả <ChevronRight size={15} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
