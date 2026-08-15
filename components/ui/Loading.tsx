export function Loading({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-medium text-slate-500">
      <span className="size-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      {label}
    </div>
  );
}
