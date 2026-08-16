import {
  BadgeCheck,
  Heart,
  Headphones,
  MapPin,
  Percent,
  Phone,
  Smartphone,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AccountNav } from "@/components/layout/AccountNav";
import { CartHeaderAction } from "@/components/layout/CartHeaderAction";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { getHomeCategories } from "@/services/product.service";

const quickLinks = [
  ["Điện thoại", "/products?category=dien-thoai", Smartphone],
  ["Apple", "/products?brand=apple", null],
  ["Samsung", "/products?brand=samsung", null],
  ["Xiaomi", "/products?brand=xiaomi", null],
  ["OPPO", "/products?brand=oppo", null],
  ["Phụ kiện", "/products?category=phu-kien", Headphones],
  ["Khuyến mãi", "/products?sort=price-asc", Percent],
] as const;

export async function Header() {
  const categories = await getHomeCategories();
  return (
    <header className="sticky top-0 z-50 shadow-[0_2px_8px_rgba(79,55,40,0.14)]">
      <div className="hidden border-b border-white/10 bg-[#6f523e] text-[12px] text-white/90 sm:block">
        <div className="mx-auto flex h-8 max-w-[1280px] items-center justify-between px-4">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Truck size={14} /> Miễn phí vận chuyển từ 5 triệu
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck size={14} /> Hàng chính hãng 100%
            </span>
            <span className="hidden items-center gap-1.5 lg:flex">
              <MapPin size={14} /> Hệ thống cửa hàng toàn quốc
            </span>
          </div>
          <a
            className="flex items-center gap-1.5 font-bold"
            href="tel:19001234"
          >
            <Phone size={13} /> 1900 1234
          </a>
        </div>
      </div>
      <div className="bg-[linear-gradient(110deg,#806047_0%,#9a7658_72%,#b48d6a_100%)] text-white">
        <div className="mx-auto flex min-h-[68px] max-w-[1280px] flex-wrap items-center gap-3 px-3 py-3 sm:px-4 lg:flex-nowrap">
          <MobileMenu />
          <Link
            aria-label="PhoneStore - Trang chủ"
            className="flex shrink-0 items-center gap-2"
            href="/"
          >
            <span className="grid size-10 place-items-center rounded-md bg-[#fdfbf7] text-lg font-black text-[#8c6d53]">
              PS
            </span>
            <span className="hidden sm:block">
              <strong className="block text-xl leading-none">PhoneStore</strong>
              <small className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                Mobile & Technology
              </small>
            </span>
          </Link>
          <HeaderSearch categories={categories} />
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <Link
              aria-label="Yêu thích"
              className="header-action"
              href="/profile/wishlist"
            >
              <Heart size={18} />
              <span className="hidden xl:inline">Yêu thích</span>
            </Link>
            <CartHeaderAction />
            <Suspense
              fallback={
                <span className="hidden h-10 w-20 rounded-md bg-black/10 xl:block" />
              }
            >
              <AccountNav />
            </Suspense>
          </div>
        </div>
        <nav className="hidden border-t border-white/15 lg:block">
          <div className="mx-auto flex h-10 max-w-[1280px] items-center justify-center px-4">
            {quickLinks.map(([label, href, Icon]) => (
              <Link
                className="flex h-full items-center gap-1.5 border-x border-transparent px-5 text-[13px] font-semibold text-white/95 transition-colors hover:bg-black/10"
                href={href}
                key={label}
              >
                {Icon ? <Icon size={14} /> : null}
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
