"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { AdminProductInput } from "@/types/admin";

type Options = {
  categories: Array<{ id: string; name: string; parentId: string | null }>;
  brands: Array<{ id: string; name: string }>;
  attributes: Array<{
    id: string;
    name: string;
    values: Array<{ id: string; value: string }>;
  }>;
};
const blankVariant = (): AdminProductInput["variants"][number] => ({
  sku: "",
  price: 0,
  salePrice: null,
  stock: 0,
  image: "",
  status: true,
  attributeValueIds: [],
});
const blankSpec = () => ({ name: "", value: "", sortOrder: 0 });

export function ProductForm({
  options,
  initial,
  id,
}: {
  options: Options;
  initial?: AdminProductInput;
  id?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [specs, setSpecs] = useState(initial?.specifications ?? []);
  const [variants, setVariants] = useState<AdminProductInput["variants"]>(
    initial?.variants ?? [blankVariant()],
  );
  const [thumbnail, setThumbnail] = useState(
    initial?.thumbnail ? [initial.thumbnail] : [],
  );
  const [images, setImages] = useState(initial?.images ?? []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name")),
      slug: String(form.get("slug")),
      categoryId: String(form.get("categoryId")),
      brandId: String(form.get("brandId")) || null,
      shortDescription: String(form.get("shortDescription")),
      description: String(form.get("description")),
      thumbnail: thumbnail[0] ?? "",
      featured: form.get("featured") === "on",
      status: String(form.get("status")),
      images,
      specifications: specs.map((spec, index) => ({
        ...spec,
        sortOrder: index,
      })),
      variants,
    };
    try {
      const response = await fetch(
        id ? `/api/admin/products/${id}` : "/api/admin/products",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({
        icon: "success",
        title: id ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm",
        timer: 1000,
        showConfirmButton: false,
      });
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể lưu sản phẩm",
        text:
          error instanceof Error ? error.message : "Vui lòng kiểm tra dữ liệu.",
      });
      setSaving(false);
    }
  }
  return (
    <form className="space-y-5" onSubmit={submit}>
      <section className="admin-card">
        <div className="border-b border-gray-200 pb-3">
          <h2 className="admin-section-title">Thông tin sản phẩm</h2>
          <p className="mt-1 text-xs text-gray-500">
            Thông tin hiển thị tại cửa hàng và kết quả tìm kiếm.
          </p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="form-label">
            Tên sản phẩm
            <input
              className="form-control"
              defaultValue={initial?.name}
              name="name"
              required
            />
          </label>
          <label className="form-label">
            Slug
            <input
              className="form-control"
              defaultValue={initial?.slug}
              name="slug"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
            />
          </label>
          <label className="form-label">
            Danh mục
            <select
              className="form-control"
              defaultValue={initial?.categoryId}
              name="categoryId"
              required
            >
              <option value="">Chọn danh mục</option>
              {options.categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.parentId ? "— " : ""}
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Thương hiệu
            <select
              className="form-control"
              defaultValue={initial?.brandId ?? ""}
              name="brandId"
            >
              <option value="">Không có</option>
              {options.brands.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label sm:col-span-2">
            Mô tả ngắn
            <textarea
              className="form-control min-h-20 py-3"
              defaultValue={initial?.shortDescription}
              name="shortDescription"
            />
          </label>
          <label className="form-label sm:col-span-2">
            Mô tả chi tiết
            <textarea
              className="form-control min-h-36 py-3"
              defaultValue={initial?.description}
              name="description"
            />
          </label>
          <div className="sm:col-span-2">
            <ImageUploadField
              label="Ảnh đại diện"
              onChange={setThumbnail}
              value={thumbnail}
            />
          </div>
          <label className="form-label">
            Trạng thái
            <select
              className="form-control"
              defaultValue={initial?.status ?? "ACTIVE"}
              name="status"
            >
              <option value="DRAFT">Nháp</option>
              <option value="ACTIVE">Đang bán</option>
              <option value="INACTIVE">Ngừng bán</option>
            </select>
          </label>
          <label className="mt-7 flex items-center gap-2 text-sm font-bold">
            <input
              defaultChecked={initial?.featured}
              name="featured"
              type="checkbox"
            />{" "}
            Sản phẩm nổi bật
          </label>
          <div className="sm:col-span-2">
            <ImageUploadField
              label="Thư viện ảnh"
              multiple
              onChange={setImages}
              value={images}
            />
          </div>
        </div>
      </section>
      <section className="admin-card">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h2 className="admin-section-title">Thông số kỹ thuật</h2>
          <button
            className="admin-add-button"
            onClick={() => setSpecs([...specs, blankSpec()])}
            type="button"
          >
            <Plus size={16} /> Thêm thông số
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {specs.map((spec, index) => (
            <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]" key={index}>
              <input
                className="form-control mt-0"
                onChange={(event) =>
                  setSpecs(
                    specs.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, name: event.target.value }
                        : item,
                    ),
                  )
                }
                placeholder="Tên thông số"
                value={spec.name}
              />
              <input
                className="form-control mt-0"
                onChange={(event) =>
                  setSpecs(
                    specs.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, value: event.target.value }
                        : item,
                    ),
                  )
                }
                placeholder="Giá trị"
                value={spec.value}
              />
              <button
                aria-label="Xóa thông số"
                className="text-rose-600"
                onClick={() =>
                  setSpecs(specs.filter((_, itemIndex) => itemIndex !== index))
                }
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>
      <section className="admin-card">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h2 className="admin-section-title">Phiên bản sản phẩm</h2>
          <button
            className="admin-add-button"
            onClick={() => setVariants([...variants, blankVariant()])}
            type="button"
          >
            <Plus size={16} /> Thêm phiên bản
          </button>
        </div>
        <div className="mt-5 space-y-5">
          {variants.map((variant, index) => (
            <div
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              key={variant.id ?? index}
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="form-label">
                  SKU
                  <input
                    className="form-control"
                    onChange={(event) =>
                      setVariants(
                        variants.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, sku: event.target.value }
                            : item,
                        ),
                      )
                    }
                    required
                    value={variant.sku}
                  />
                </label>
                <label className="form-label">
                  Giá
                  <input
                    className="form-control"
                    min="1"
                    onChange={(event) =>
                      setVariants(
                        variants.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, price: Number(event.target.value) }
                            : item,
                        ),
                      )
                    }
                    required
                    type="number"
                    value={variant.price}
                  />
                </label>
                <label className="form-label">
                  Giá sale
                  <input
                    className="form-control"
                    min="1"
                    onChange={(event) =>
                      setVariants(
                        variants.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                salePrice: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              }
                            : item,
                        ),
                      )
                    }
                    type="number"
                    value={variant.salePrice ?? ""}
                  />
                </label>
                <label className="form-label">
                  Tồn kho
                  <input
                    className="form-control"
                    min="0"
                    onChange={(event) =>
                      setVariants(
                        variants.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, stock: Number(event.target.value) }
                            : item,
                        ),
                      )
                    }
                    required
                    type="number"
                    value={variant.stock}
                  />
                </label>
              </div>
              <div className="mt-4">
                <ImageUploadField
                  label="Ảnh phiên bản"
                  onChange={(urls) =>
                    setVariants(
                      variants.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, image: urls[0] ?? "" }
                          : item,
                      ),
                    )
                  }
                  value={variant.image ? [variant.image] : []}
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {options.attributes.map((attribute) => (
                  <label className="form-label" key={attribute.id}>
                    {attribute.name}
                    <select
                      className="form-control"
                      onChange={(event) => {
                        const groupIds = new Set(
                          attribute.values.map((value) => value.id),
                        );
                        const kept = variant.attributeValueIds.filter(
                          (value) => !groupIds.has(value),
                        );
                        setVariants(
                          variants.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  attributeValueIds: event.target.value
                                    ? [...kept, event.target.value]
                                    : kept,
                                }
                              : item,
                          ),
                        );
                      }}
                      value={
                        variant.attributeValueIds.find((value) =>
                          attribute.values.some(
                            (option) => option.id === value,
                          ),
                        ) ?? ""
                      }
                    >
                      <option value="">Không chọn</option>
                      {attribute.values.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.value}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex justify-between">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input
                    checked={variant.status}
                    onChange={(event) =>
                      setVariants(
                        variants.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, status: event.target.checked }
                            : item,
                        ),
                      )
                    }
                    type="checkbox"
                  />{" "}
                  Kích hoạt
                </label>
                {variants.length > 1 ? (
                  <button
                    className="text-sm font-bold text-rose-600"
                    onClick={() =>
                      setVariants(
                        variants.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    type="button"
                  >
                    Xóa phiên bản
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
      <button
        className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#cb1c22] px-6 font-bold text-white hover:bg-[#a9161d] disabled:bg-gray-300"
        disabled={saving}
      >
        <Save size={19} />
        {saving ? "Đang lưu..." : "Lưu sản phẩm"}
      </button>
    </form>
  );
}
