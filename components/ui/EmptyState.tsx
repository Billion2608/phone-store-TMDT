import { PackageOpen } from "lucide-react";

export function EmptyState({
  title = "Chưa có dữ liệu",
  description = "Hãy thử thay đổi điều kiện tìm kiếm.",
}) {
  return (
    <div className="col-span-full flex min-h-56 flex-col items-center justify-center border border-dashed border-gray-300 bg-white p-6 text-center">
      <span className="mb-3 bg-gray-100 p-3 text-gray-500">
        <PackageOpen size={25} />
      </span>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}
