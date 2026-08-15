"use client";
import { ImageIcon, Pencil, Plus, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { DateTimeSelect } from "@/components/admin/DateTimeSelect";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  buttonText: string | null;
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
  status: boolean;
};
const empty = {
  title: "",
  subtitle: null,
  imageUrl: "",
  linkUrl: "/products",
  buttonText: "Xem ngay",
  sortOrder: 0,
  startDate: null,
  endDate: null,
  status: true,
};
export function BannerManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<Banner | null>(null);
  const [image, setImage] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const current = edit ?? empty;
  function choose(item: Banner | null) {
    setEdit(item);
    setImage(item?.imageUrl ? [item.imageUrl] : []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image[0])
      return void Swal.fire({
        icon: "warning",
        title: "Vui lòng tải ảnh banner",
      });
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const start = String(form.get("startDate") || "");
    const end = String(form.get("endDate") || "");
    const payload = {
      title: form.get("title"),
      subtitle: form.get("subtitle"),
      imageUrl: image[0],
      linkUrl: form.get("linkUrl"),
      buttonText: form.get("buttonText"),
      sortOrder: Number(form.get("sortOrder")),
      startDate: start ? new Date(start).toISOString() : null,
      endDate: end ? new Date(end).toISOString() : null,
      status: form.has("status"),
    };
    try {
      const response = await fetch(
        edit ? `/api/admin/banners/${edit.id}` : "/api/admin/banners",
        {
          method: edit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({
        icon: "success",
        title: edit ? "Đã cập nhật banner" : "Đã tạo banner",
        timer: 900,
        showConfirmButton: false,
      });
      choose(null);
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể lưu banner",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  }
  async function remove(id: string) {
    const choice = await Swal.fire({
      icon: "warning",
      title: "Xóa banner này?",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (!choice.isConfirmed) return;
    const response = await fetch(`/api/admin/banners/${id}`, {
      method: "DELETE",
    });
    if (response.ok) router.refresh();
    else await Swal.fire({ icon: "warning", title: "Không thể xóa banner" });
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
      <form
        autoComplete="off"
        className="admin-card h-fit"
        key={edit?.id ?? "new"}
        onSubmit={submit}
      >
        <div className="flex items-center justify-between border-b border-[#e7dfd5] pb-3">
          <div>
            <h2 className="admin-section-title">
              {edit ? "Cập nhật banner" : "Thêm banner"}
            </h2>
            <p className="mt-1 text-xs text-[#7d7068]">
              Ảnh đề xuất tỷ lệ 16:5, dung lượng dưới 5MB.
            </p>
          </div>
          {edit ? (
            <button
              className="admin-add-button"
              onClick={() => choose(null)}
              type="button"
            >
              <Plus size={15} /> Tạo mới
            </button>
          ) : null}
        </div>
        <div className="mt-4 space-y-4">
          <label className="form-label">
            Tiêu đề
            <input
              className="form-control"
              defaultValue={current.title}
              name="title"
              required
            />
          </label>
          <label className="form-label">
            Nội dung phụ
            <textarea
              className="form-control min-h-20 py-2"
              defaultValue={current.subtitle ?? ""}
              name="subtitle"
            />
          </label>
          <ImageUploadField
            label="Ảnh banner"
            onChange={setImage}
            value={image}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="form-label">
              Đường dẫn
              <input
                className="form-control"
                defaultValue={current.linkUrl ?? ""}
                name="linkUrl"
              />
            </label>
            <label className="form-label">
              Chữ trên nút
              <input
                className="form-control"
                defaultValue={current.buttonText ?? ""}
                name="buttonText"
              />
            </label>
            <label className="form-label">
              Thứ tự
              <input
                className="form-control"
                defaultValue={current.sortOrder}
                min="0"
                name="sortOrder"
                type="number"
              />
            </label>
            <label className="mt-7 flex items-center gap-2 text-sm font-bold">
              <input
                defaultChecked={current.status}
                name="status"
                type="checkbox"
              />{" "}
              Đang hiển thị
            </label>
          </div>
          <DateTimeSelect
            label="Bắt đầu hiển thị"
            name="startDate"
            value={current.startDate}
          />
          <DateTimeSelect
            label="Kết thúc hiển thị"
            name="endDate"
            value={current.endDate}
          />
        </div>
        <button className="admin-primary-button mt-5 w-full" disabled={saving}>
          <Save size={17} />
          {saving ? "Đang lưu..." : "Lưu banner"}
        </button>
      </form>
      <section className="admin-card">
        <div className="mb-4">
          <h2 className="admin-section-title">Danh sách banner</h2>
          <p className="mt-1 text-xs text-[#7d7068]">
            Sắp xếp theo thứ tự hiển thị trên trang chủ.
          </p>
        </div>
        {banners.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {banners.map((item) => (
              <article
                className="overflow-hidden rounded-lg border border-[#e7dfd5]"
                key={item.id}
              >
                <div className="relative aspect-[16/6] bg-[#f5f2eb]">
                  {item.imageUrl ? (
                    <Image
                      alt={item.title}
                      className="object-cover"
                      fill
                      sizes="500px"
                      src={item.imageUrl}
                    />
                  ) : (
                    <ImageIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong>{item.title}</strong>
                      <p className="mt-1 line-clamp-2 text-xs text-[#7d7068]">
                        {item.subtitle || "Không có nội dung phụ"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {item.status ? "Đang hiển thị" : "Đang ẩn"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#eee8e1] pt-3 text-xs">
                    <span>Thứ tự: {item.sortOrder}</span>
                    <div className="flex gap-2">
                      <button
                        className="flex items-center gap-1 font-bold text-[#8c6d53]"
                        onClick={() => choose(item)}
                      >
                        <Pencil size={14} /> Sửa
                      </button>
                      <button
                        className="flex items-center gap-1 font-bold text-rose-600"
                        onClick={() => void remove(item.id)}
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#d9cabc] p-10 text-center text-sm text-[#7d7068]">
            Chưa có banner nào.
          </div>
        )}
      </section>
    </div>
  );
}
