import {
  BadgeCheck,
  Headphones,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
const services = [
  [Truck, "Giao hàng toàn quốc"],
  [BadgeCheck, "Sản phẩm chính hãng"],
  [RefreshCcw, "Đổi trả thuận tiện"],
  [ShieldCheck, "Bảo hành uy tín"],
  [Headphones, "Hỗ trợ tận tâm"],
] as const;
export function ServiceStrip() {
  return (
    <section className="mx-auto max-w-[1280px] px-3 sm:px-4">
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#e7dfd5] bg-white shadow-sm sm:grid-cols-3 lg:grid-cols-5">
        {services.map(([Icon, label]) => (
          <div
            className="flex items-center gap-3 border-b border-r border-[#eee8e1] px-3 py-4 text-xs font-semibold text-[#4a3a32] sm:text-sm"
            key={label}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#f5f2eb] text-[#d97706]">
              <Icon size={20} />
            </span>
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
