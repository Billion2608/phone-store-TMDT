"use client";
import { RotateCcw } from "lucide-react";
export default function ProductsError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-80 max-w-xl flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-bold text-gray-900">
        Không thể tải sản phẩm
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Đã có lỗi khi đọc dữ liệu. Vui lòng thử lại.
      </p>
      <button
        className="mt-4 inline-flex items-center gap-2 rounded-sm bg-blue-600 px-4 py-2.5 font-bold text-white"
        onClick={reset}
      >
        <RotateCcw size={17} />
        Thử lại
      </button>
    </div>
  );
}
