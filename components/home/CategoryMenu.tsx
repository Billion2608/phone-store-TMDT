import {
  BatteryCharging,
  ChevronRight,
  Headphones,
  PlugZap,
  Shield,
  Smartphone,
  Watch,
} from "lucide-react";
import Link from "next/link";
const fixed = [
  ["iPhone", "/products?brand=apple", Smartphone],
  ["Samsung", "/products?brand=samsung", Smartphone],
  ["Xiaomi", "/products?brand=xiaomi", Smartphone],
  ["OPPO", "/products?brand=oppo", Smartphone],
  ["Điện thoại", "/products?category=dien-thoai", Smartphone],
  ["Tai nghe", "/products?search=tai+nghe", Headphones],
  ["Sạc & cáp", "/products?search=sạc", PlugZap],
  ["Pin dự phòng", "/products?search=pin+dự+phòng", BatteryCharging],
  ["Ốp lưng", "/products?search=ốp+lưng", Shield],
  ["Đồng hồ thông minh", "/products?search=đồng+hồ", Watch],
] as const;
export function CategoryMenu() {
  return (
    <aside className="hidden w-60 shrink-0 border border-gray-200 bg-white lg:block">
      <h2 className="bg-gray-100 px-4 py-2.5 text-sm font-bold uppercase text-gray-800">
        Danh mục sản phẩm
      </h2>
      {fixed.map(([label, href, Icon]) => (
        <Link
          className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 text-[13px] text-gray-700 last:border-0 hover:bg-red-50 hover:text-red-600"
          href={href}
          key={label}
        >
          <Icon size={16} />
          <span className="flex-1">{label}</span>
          <ChevronRight size={14} />
        </Link>
      ))}
    </aside>
  );
}
