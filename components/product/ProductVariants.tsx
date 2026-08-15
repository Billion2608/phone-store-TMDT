"use client";
import { Check, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/Badge";
import type { ProductVariantData } from "@/types/product";
import { formatCurrency } from "@/utils/formatCurrency";
export function ProductVariants({
  variants,
}: {
  variants: ProductVariantData[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const [adding, setAdding] = useState(false);
  const selected =
    variants.find((variant) => variant.id === selectedId) ?? variants[0];
  const attributeGroups = useMemo(() => {
    const groups = new Map<string, string[]>();
    variants.forEach((variant) =>
      variant.attributes.forEach((attribute) => {
        const values = groups.get(attribute.name) ?? [];
        if (!values.includes(attribute.value)) values.push(attribute.value);
        groups.set(attribute.name, values);
      }),
    );
    return [...groups.entries()];
  }, [variants]);
  function selectAttribute(name: string, value: string) {
    const candidate =
      variants.find((variant) => {
        const chosen = variant.attributes.some(
          (attribute) => attribute.name === name && attribute.value === value,
        );
        if (!chosen) return false;
        if (!selected) return true;
        return selected.attributes.every(
          (attribute) =>
            attribute.name === name ||
            variant.attributes.some(
              (item) =>
                item.name === attribute.name && item.value === attribute.value,
            ),
        );
      }) ??
      variants.find((variant) =>
        variant.attributes.some(
          (attribute) => attribute.name === name && attribute.value === value,
        ),
      );
    if (candidate) setSelectedId(candidate.id);
  }
  if (!selected)
    return (
      <div className="mt-4 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Sản phẩm chưa có phiên bản đang bán.
      </div>
    );
  const currentPrice = selected.salePrice ?? selected.price;
  async function addToCart() {
    setAdding(true);
    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selected.id, quantity: 1 }),
      });
      const result = await response.json();
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({
        icon: "success",
        title: "Đã thêm vào giỏ hàng",
        showCancelButton: true,
        confirmButtonText: "Xem giỏ hàng",
        cancelButtonText: "Tiếp tục mua",
      }).then((choice) => {
        if (choice.isConfirmed) router.push("/cart");
      });
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể thêm sản phẩm",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setAdding(false);
    }
  }
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-end gap-3">
        <p className="text-[28px] font-black text-red-600">
          {formatCurrency(currentPrice)}
        </p>
        {selected.salePrice ? (
          <p className="pb-1 text-sm text-gray-400 line-through">
            {formatCurrency(selected.price)}
          </p>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
        <Badge tone={selected.stock > 0 ? "green" : "amber"}>
          {selected.stock > 0 ? `Còn ${selected.stock} sản phẩm` : "Hết hàng"}
        </Badge>
        <span>
          SKU: <strong>{selected.sku}</strong>
        </span>
      </div>
      <div className="mt-5 space-y-4">
        {attributeGroups.map(([name, values]) => (
          <fieldset key={name}>
            <legend className="mb-2 text-sm font-bold text-gray-800">
              Chọn {name}
            </legend>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const active = selected.attributes.some(
                  (attribute) =>
                    attribute.name === name && attribute.value === value,
                );
                return (
                  <button
                    className={`min-h-10 rounded-sm border px-4 text-sm font-semibold ${active ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 bg-white hover:border-blue-400"}`}
                    key={value}
                    onClick={() => selectAttribute(name, value)}
                  >
                    {active ? (
                      <Check className="mr-1 inline" size={14} />
                    ) : null}
                    {value}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
        {variants.length > 1 && attributeGroups.length === 0 ? (
          <fieldset>
            <legend className="mb-2 text-sm font-bold">Chọn phiên bản</legend>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <button
                  className={`rounded-sm border px-4 py-2 text-left text-sm ${variant.id === selected.id ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}
                  key={variant.id}
                  onClick={() => setSelectedId(variant.id)}
                >
                  <strong>{variant.sku}</strong>
                  <span className="block text-xs text-gray-500">
                    {formatCurrency(variant.salePrice ?? variant.price)}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}
      </div>
      <button
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:bg-gray-300"
        disabled={selected.stock <= 0 || adding}
        onClick={addToCart}
      >
        <PackageCheck size={20} />
        {adding
          ? "Đang thêm..."
          : selected.stock > 0
            ? "THÊM VÀO GIỎ HÀNG"
            : "PHIÊN BẢN ĐÃ HẾT HÀNG"}
      </button>
      <div className="mt-4 grid grid-cols-2 border border-gray-200 text-xs font-medium text-gray-600">
        <span className="flex items-center gap-2 border-r border-gray-200 p-3">
          <Truck className="text-blue-600" size={18} />
          Giao hàng toàn quốc
        </span>
        <span className="flex items-center gap-2 p-3">
          <ShieldCheck className="text-blue-600" size={18} />
          Bảo hành chính hãng
        </span>
      </div>
    </div>
  );
}
