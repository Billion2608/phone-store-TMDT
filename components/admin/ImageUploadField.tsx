"use client";

import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import Swal from "sweetalert2";

export function ImageUploadField({
  label,
  value,
  onChange,
  multiple = false,
}: {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const data = new FormData();
    Array.from(files).forEach((file) => data.append("files", file));
    try {
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      onChange(
        multiple
          ? [...value, ...result.data.urls]
          : result.data.urls.slice(0, 1),
      );
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể tải ảnh",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }
  return (
    <div>
      <span className="form-label">{label}</span>
      <input
        ref={inputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        multiple={multiple}
        onChange={(event) => void upload(event.target.files)}
        type="file"
      />
      <button
        className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-dashed border-red-300 bg-red-50 px-4 text-sm font-bold text-[#cb1c22] hover:bg-red-100 disabled:opacity-60"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {uploading ? (
          <LoaderCircle className="animate-spin" size={18} />
        ) : (
          <ImagePlus size={18} />
        )}
        {uploading
          ? "Đang tải ảnh..."
          : multiple
            ? "Chọn nhiều ảnh từ máy"
            : "Chọn ảnh từ máy"}
      </button>
      {value.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {value.map((url) => (
            <div
              className="group relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-50"
              key={url}
            >
              <Image
                alt="Ảnh sản phẩm"
                className="object-contain"
                fill
                sizes="120px"
                src={url}
              />
              <button
                aria-label="Xóa ảnh"
                className="absolute right-1 top-1 grid size-7 place-items-center rounded bg-white/90 text-red-600 opacity-100 shadow sm:opacity-0 sm:group-hover:opacity-100"
                onClick={() => onChange(value.filter((item) => item !== url))}
                type="button"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-400">
          Chưa có ảnh được chọn. Hỗ trợ JPG, PNG, WEBP, GIF; tối đa 5MB/ảnh.
        </p>
      )}
    </div>
  );
}
