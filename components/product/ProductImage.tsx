"use client";

import { ImageIcon } from "lucide-react";
import { useState } from "react";

export function ProductImage({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(!src);
  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      {!failed && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={alt}
          className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
          onError={() => setFailed(true)}
          src={src}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
          <ImageIcon size={42} strokeWidth={1.5} />
          <span className="max-w-40 text-center text-xs font-medium">
            {alt}
          </span>
        </div>
      )}
    </div>
  );
}
