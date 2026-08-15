import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

function pageHref(page: number, params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page") query.set(key, value);
  });
  if (page > 1) query.set("page", String(page));
  const value = query.toString();
  return value ? `/products?${value}` : "/products";
}

export function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (value) =>
      value === 1 || value === totalPages || Math.abs(value - page) <= 1,
  );

  return (
    <nav
      aria-label="Phân trang"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <Link
        aria-disabled={page === 1}
        className={`pagination-link ${page === 1 ? "pointer-events-none opacity-40" : ""}`}
        href={pageHref(page - 1, params)}
      >
        <ChevronLeft size={18} />
        <span className="sr-only">Trang trước</span>
      </Link>
      {pages.map((value, index) => (
        <span className="contents" key={value}>
          {index > 0 && pages[index - 1] !== value - 1 ? (
            <span className="px-1 text-slate-400">…</span>
          ) : null}
          <Link
            aria-current={value === page ? "page" : undefined}
            className={`pagination-link ${value === page ? "bg-blue-600 text-white" : ""}`}
            href={pageHref(value, params)}
          >
            {value}
          </Link>
        </span>
      ))}
      <Link
        aria-disabled={page === totalPages}
        className={`pagination-link ${page === totalPages ? "pointer-events-none opacity-40" : ""}`}
        href={pageHref(page + 1, params)}
      >
        <ChevronRight size={18} />
        <span className="sr-only">Trang sau</span>
      </Link>
    </nav>
  );
}
