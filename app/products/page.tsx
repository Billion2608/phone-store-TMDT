import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getFilterOptions, getProducts } from "@/services/product.service";
import type { ProductSort } from "@/types/product";
export const metadata: Metadata = { title: "Sản phẩm" };
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;
const positiveNumber = (value: string | undefined) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
};
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const values = {
    search: one(raw.search)?.trim() || undefined,
    category: one(raw.category) || undefined,
    brand: one(raw.brand) || undefined,
    minPrice: one(raw.minPrice) || undefined,
    maxPrice: one(raw.maxPrice) || undefined,
    sort: one(raw.sort) || "newest",
    page: one(raw.page) || undefined,
  };
  const allowedSorts: ProductSort[] = [
    "newest",
    "price-asc",
    "price-desc",
    "best-selling",
  ];
  const sort = allowedSorts.includes(values.sort as ProductSort)
    ? (values.sort as ProductSort)
    : "newest";
  const [result, options] = await Promise.all([
    getProducts({
      search: values.search,
      category: values.category,
      brand: values.brand,
      minPrice: positiveNumber(values.minPrice),
      maxPrice: positiveNumber(values.maxPrice),
      sort,
      page: positiveNumber(values.page),
      limit: 20,
    }),
    getFilterOptions(),
  ]);
  return (
    <div className="bg-[#f5f5f5] pb-10">
      <div className="mx-auto max-w-[1280px] px-3 py-4 sm:px-4">
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <Link className="hover:text-blue-600" href="/">
            Trang chủ
          </Link>
          <ChevronRight size={13} />
          <span>Sản phẩm</span>
        </nav>
        <div className="mt-3 border-b border-gray-200 pb-3">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Tất cả sản phẩm
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tìm thấy {result.pagination.total} sản phẩm phù hợp
          </p>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr]">
          <ProductFilters
            brands={options.brands}
            categories={options.categories}
            values={values}
          />
          <main className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
              <span>
                Trang {result.pagination.page}/{result.pagination.totalPages}
              </span>
              <strong className="text-gray-800">
                {sort === "newest"
                  ? "Mới nhất"
                  : sort === "price-asc"
                    ? "Giá tăng dần"
                    : sort === "price-desc"
                      ? "Giá giảm dần"
                      : "Bán chạy"}
              </strong>
            </div>
            <ProductGrid products={result.items} />
            <Pagination
              page={result.pagination.page}
              params={values}
              totalPages={result.pagination.totalPages}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
