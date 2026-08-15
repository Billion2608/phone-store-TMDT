"use client";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
export function CartHeaderAction() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let active = true;
    fetch("/api/cart")
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (active && result?.success)
          setCount(Number(result.data.itemCount) || 0);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return (
    <Link
      aria-label={`Giỏ hàng${count ? `, ${count} sản phẩm` : ""}`}
      className="header-action relative"
      href="/cart"
    >
      <ShoppingCart size={20} />
      <span className="hidden xl:inline">Giỏ hàng</span>
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-4 bg-yellow-400 px-1 text-center text-[10px] font-bold leading-4 text-red-800">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
