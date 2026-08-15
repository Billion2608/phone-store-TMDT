"use client";

import { ChevronDown, Grid2X2, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function CategoryDropdown({
  categories,
}: {
  categories: Array<{ name: string; slug: string }>;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div
      className="category-dropdown relative hidden shrink-0 md:block"
      ref={root}
    >
      <button
        aria-expanded={open}
        className="flex h-11 items-center gap-2 rounded-l-md border-r border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 transition-colors hover:bg-[#f5f2eb] aria-expanded:bg-[#f5f2eb]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Menu className="shrink-0" size={17} /> Danh mục{" "}
        <ChevronDown
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          size={14}
        />
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-[70] w-[620px] rounded-lg border border-gray-200 bg-white p-4 text-gray-800 shadow-xl">
          <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
            <strong className="flex items-center gap-2 text-base">
              <Grid2X2 className="text-[#cb1c22]" size={18} /> Danh mục sản phẩm
            </strong>
            <button
              aria-label="Đóng danh mục"
              className="text-gray-400 hover:text-gray-800"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <Link
                className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm font-semibold transition hover:border-red-200 hover:bg-red-50 hover:text-[#cb1c22]"
                href={`/products?category=${category.slug}`}
                key={category.slug}
                onClick={() => setOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
          <Link
            className="mt-3 block rounded-md bg-[#cb1c22] px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-[#a9161d]"
            href="/products"
            onClick={() => setOpen(false)}
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
      ) : null}
    </div>
  );
}
