import {
  BatteryCharging,
  Cable,
  Headphones,
  Shield,
  Smartphone,
  Watch,
} from "lucide-react";
import Link from "next/link";
const icons = [Smartphone, Headphones, Cable, BatteryCharging, Shield, Watch];
export function FeaturedCategories({
  categories,
}: {
  categories: Array<{ name: string; slug: string }>;
}) {
  if (!categories.length) return null;
  return (
    <section className="retail-section">
      <div className="overflow-hidden rounded-lg border border-[#e7dfd5] bg-white p-3 shadow-sm sm:p-4">
        <h2 className="mb-4 text-xl font-bold text-[#2c221e]">
          Danh mục nổi bật
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {categories.slice(0, 10).map((category, index) => {
            const Icon = icons[index % icons.length];
            return (
              <Link
                className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-transparent bg-[#fdfbf7] p-2 text-center transition-colors hover:border-[#d9c6b5] hover:bg-[#f5f2eb] hover:text-[#8c6d53]"
                href={`/products?category=${category.slug}`}
                key={category.slug}
              >
                <span className="grid size-12 place-items-center rounded-full bg-white text-[#d97706] shadow-sm">
                  <Icon size={25} />
                </span>
                <strong className="line-clamp-2 text-xs sm:text-sm">
                  {category.name}
                </strong>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
