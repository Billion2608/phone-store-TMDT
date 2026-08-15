"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { ApiActionButton } from "@/components/admin/ApiActionButton";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
type Brand = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  status: boolean;
  productCount: number;
};
const empty = {
  name: "",
  slug: "",
  logo: null,
  description: null,
  status: true,
};
export function BrandManager({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<Brand | null>(null);
  const [logo, setLogo] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  function choose(item: Brand | null) {
    setEdit(item);
    setLogo(item?.logo ? [item.logo] : []);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      slug: form.get("slug"),
      logo: logo[0] ?? "",
      description: form.get("description"),
      status: form.get("status") === "on",
    };
    try {
      const response = await fetch(
        edit ? `/api/admin/brands/${edit.id}` : "/api/admin/brands",
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
        title: "Đã lưu thương hiệu",
        timer: 800,
        showConfirmButton: false,
      });
      choose(null);
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể lưu",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  }
  const current = edit ?? empty;
  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      <form
        className="admin-card h-fit"
        key={edit?.id ?? "new"}
        onSubmit={submit}
      >
        <h2 className="admin-section-title">
          {edit ? "Sửa thương hiệu" : "Thêm thương hiệu"}
        </h2>
        <label className="form-label mt-4">
          Tên
          <input
            className="form-control"
            defaultValue={current.name}
            name="name"
            required
          />
        </label>
        <label className="form-label mt-4">
          Đường dẫn định danh
          <input
            className="form-control"
            defaultValue={current.slug}
            name="slug"
            required
          />
        </label>
        <div className="mt-4">
          <ImageUploadField
            label="Biểu trưng thương hiệu"
            onChange={setLogo}
            value={logo}
          />
        </div>
        <label className="form-label mt-4">
          Mô tả
          <textarea
            className="form-control min-h-24 py-3"
            defaultValue={current.description ?? ""}
            name="description"
          />
        </label>
        <label className="mt-4 flex gap-2 text-sm font-bold">
          <input
            defaultChecked={current.status}
            name="status"
            type="checkbox"
          />{" "}
          Đang hoạt động
        </label>
        <div className="mt-5 flex gap-2">
          <button className="admin-primary-button flex-1" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
          {edit ? (
            <button
              className="rounded-md border px-4 font-bold"
              onClick={() => choose(null)}
              type="button"
            >
              Hủy
            </button>
          ) : null}
        </div>
      </form>
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thương hiệu</th>
                <th>Sản phẩm</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {brands.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <small className="block text-slate-400">{item.slug}</small>
                  </td>
                  <td>{item.productCount}</td>
                  <td>{item.status ? "Đang hoạt động" : "Ngừng hoạt động"}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="rounded-md bg-[#f5f2eb] px-3 py-2 text-xs font-bold text-[#8c6d53]"
                        onClick={() => choose(item)}
                      >
                        Sửa
                      </button>
                      <ApiActionButton
                        className="bg-rose-50 text-rose-700"
                        confirmText="Xóa thương hiệu này?"
                        label="Xóa"
                        method="DELETE"
                        url={`/api/admin/brands/${item.id}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
