import { Bell, Search, ShieldCheck, Store } from "lucide-react";
import Link from "next/link";

export function AdminHeader({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-50 flex min-h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 pl-16 backdrop-blur lg:px-6">
      <div className="w-56 shrink-0 min-w-0">
        <strong className="block truncate text-base text-slate-900">
          Bảng điều khiển
        </strong>
        <span className="hidden truncate text-xs text-slate-500 xl:block">
          Quản lý hoạt động cửa hàng
        </span>
      </div>
      <div className="relative mx-auto hidden w-full max-w-2xl md:block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          aria-label="Tìm trong trang quản trị"
          autoComplete="off"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-[#8c6d53] focus:bg-white"
          placeholder="Tìm kiếm nhanh..."
        />
      </div>
      <Link
        aria-label="Xem cửa hàng"
        className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#8c6d53]"
        href="/"
      >
        <Store size={18} />
      </Link>
      <button
        aria-label="Thông báo"
        className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#8c6d53]"
      >
        <Bell size={18} />
      </button>
      <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3 text-sm">
        <span className="grid size-9 place-items-center rounded-full bg-[#f5f2eb]">
          <ShieldCheck className="text-[#8c6d53]" size={18} />
        </span>
        <span className="hidden sm:block">
          <small className="block text-[10px] text-slate-400">
            Quản trị viên
          </small>
          <strong className="block max-w-28 truncate">{name}</strong>
        </span>
      </div>
    </header>
  );
}
