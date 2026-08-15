import { Filter, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
type FilterValues = Record<string, string | undefined>;
export function ProductFilters({
  categories,
  brands,
  values,
}: {
  categories: Array<{ name: string; slug: string }>;
  brands: Array<{ name: string; slug: string }>;
  values: FilterValues;
}) {
  return (
    <aside className="h-fit overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:sticky lg:top-32">
      <div className="flex min-h-14 items-center gap-2.5 bg-[var(--retail-red)] px-4 text-white">
        <Filter className="shrink-0" size={19} strokeWidth={2} />
        <h2 className="m-0 text-base font-bold leading-none">
          Bộ lọc sản phẩm
        </h2>
      </div>
      <form action="/products" className="divide-y divide-gray-100">
        <div className="p-4">
          <label className="filter-label">Tìm kiếm</label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="filter-control filter-search-control"
              defaultValue={values.search}
              name="search"
              placeholder="Tên sản phẩm"
            />
          </div>
        </div>
        <div className="p-4">
          <label className="filter-label">Danh mục</label>
          <select
            className="filter-control"
            defaultValue={values.category ?? ""}
            name="category"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="p-4">
          <label className="filter-label">Thương hiệu</label>
          <select
            className="filter-control"
            defaultValue={values.brand ?? ""}
            name="brand"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="p-4">
          <legend className="filter-label">Khoảng giá</legend>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="filter-control"
              defaultValue={values.minPrice}
              min="0"
              name="minPrice"
              placeholder="Từ"
              type="number"
            />
            <input
              className="filter-control"
              defaultValue={values.maxPrice}
              min="0"
              name="maxPrice"
              placeholder="Đến"
              type="number"
            />
          </div>
        </fieldset>
        <div className="p-4">
          <label className="filter-label">Sắp xếp</label>
          <select
            className="filter-control"
            defaultValue={values.sort ?? "newest"}
            name="sort"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="best-selling">Bán chạy</option>
          </select>
        </div>
        <div className="p-4">
          <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-transparent bg-[var(--retail-red)] text-sm font-bold text-white transition-colors hover:bg-[var(--retail-dark-red)]">
            <SlidersHorizontal className="shrink-0" size={16} /> Áp dụng bộ lọc
          </button>
          <Link
            className="mt-2 block text-center text-xs font-semibold text-gray-500 hover:text-[var(--retail-red)]"
            href="/products"
          >
            Xóa bộ lọc
          </Link>
        </div>
      </form>
    </aside>
  );
}
