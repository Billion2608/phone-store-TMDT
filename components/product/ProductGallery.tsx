"use client";
import { useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
export function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selected, setSelected] = useState(images[0] ?? null);
  return (
    <div>
      <ProductImage
        alt={productName}
        className="aspect-square border border-gray-200"
        src={selected}
      />
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              aria-label={`Xem ảnh ${index + 1}`}
              className={`overflow-hidden border ${selected === image ? "border-blue-500" : "border-gray-200"}`}
              key={`${image}-${index}`}
              onClick={() => setSelected(image)}
            >
              <ProductImage
                alt={`${productName} ${index + 1}`}
                className="aspect-square"
                src={image}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
