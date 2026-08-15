"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SiteShell({
  children,
  header,
  footer,
  advisor,
}: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  advisor: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      {header}
      <main className="flex flex-1 flex-col">{children}</main>
      {footer}
      {advisor}
    </>
  );
}
