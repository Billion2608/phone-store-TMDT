import { Headphones, Smartphone, Tag } from "lucide-react";
import Link from "next/link";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { HomeHero } from "@/components/home/HomeHero";
import { ProductSection } from "@/components/home/ProductSection";
import { ServiceStrip } from "@/components/home/ServiceStrip";
import { getActiveBanners } from "@/services/banner.service";
import {
  getActiveBrands,
  getFeaturedProducts,
  getHomeCategories,
  getProducts,
  getProductsByCategoryRoot,
} from "@/services/product.service";

export const dynamic = "force-dynamic";

interface BrandItem {
  name: string;
  slug: string;
  logo?: string | null;
}

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  href: string;
  buttonText?: string;
}

export default async function Home() {
  const [
    featured,
    phones,
    apple,
    accessories,
    promotions,
    brandsData,
    categories,
    bannersData,
  ] = await Promise.all([
    getFeaturedProducts(10),
    getProductsByCategoryRoot("dien-thoai", 10),
    getProducts({ brand: "apple", sort: "best-selling", limit: 10 }),
    getProductsByCategoryRoot("phu-kien", 10),
    getProducts({ sort: "price-asc", limit: 10 }),
    getActiveBrands(),
    getHomeCategories(),
    getActiveBanners(),
  ]);

  const brands: BrandItem[] = (brandsData as BrandItem[]) || [];
  const banners: BannerItem[] = (bannersData as BannerItem[]) || [];

  const brandTabs = brands.slice(0, 6).map((brand: BrandItem) => ({
    label: brand.name,
    href: `/products?brand=${brand.slug}`,
  }));

  const fallbackSlides = [...featured, ...phones]
    .filter(
      (product, index, list) =>
        list.findIndex((item) => item.id === product.id) === index
    )
    .slice(0, 3)
    .map((product) => ({
      id: product.id,
      title: product.name,
      subtitle: "Sản phẩm chính hãng, giá tốt và giao hàng toàn quốc.",
      image: product.thumbnail || "",
      href: `/products/${product.slug}`,
      buttonText: "Xem sản phẩm",
      cover: true,
    }));

  const slides = banners.length
    ? banners.map((banner: BannerItem) => ({ ...banner, cover: true }))
    : fallbackSlides;

  return (
    <div className="bg-[#fdfbf7] pb-8">
      <HomeHero slides={slides} />
      <div className="mt-3">
        <ServiceStrip />
      </div>
      <FeaturedCategories categories={categories} />
      <section className="retail-section">
        <div className="border-y border-[#e7dfd5] py-4">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl font-bold text-[#2c221e]">Thương hiệu</h2>
            <Link
              className="text-xs font-bold text-[#8c6d53] hover:text-[#6f523e]"
              href="/products"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {brands.map((brand: BrandItem) => (
              <Link
                className="min-w-28 flex-1 rounded-md border border-[#e7dfd5] bg-white px-4 py-2.5 text-center text-sm font-bold text-[#4a3a32] transition-colors hover:border-[#cdb9a7] hover:bg-[#f5f2eb]"
                href={`/products?brand=${brand.slug}`}
                key={brand.slug}
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <ProductSection
        bestSellerTitle="iPhone bán chạy"
        featured
        href="/products?brand=apple"
        icon={<Smartphone size={18} />}
        products={apple.items}
        tabs={[
          { label: "Hàng mới", href: "/products?brand=apple&sort=newest" },
          {
            label: "Bán chạy",
            href: "/products?brand=apple&sort=best-selling",
          },
        ]}
        title="Apple - iPhone"
      />
      <ProductSection
        href="/products"
        icon={<Smartphone size={18} />}
        products={featured}
        tabs={brandTabs}
        title="Điện thoại nổi bật"
      />
      <ProductSection
        href="/products?category=phu-kien"
        icon={<Headphones size={18} />}
        products={accessories}
        tabs={[
          { label: "Tai nghe", href: "/products?search=tai+nghe" },
          { label: "Sạc", href: "/products?search=sạc" },
          { label: "Pin dự phòng", href: "/products?search=pin+dự+phòng" },
        ]}
        title="Phụ kiện"
      />
      <ProductSection
        href="/products?sort=best-selling"
        icon={<Tag size={18} />}
        products={phones}
        title="Sản phẩm bán chạy"
      />
      <ProductSection
        href="/products?sort=price-asc"
        icon={<Tag size={18} />}
        products={promotions.items}
        title="Khuyến mãi"
      />
    </div>
  );
}
