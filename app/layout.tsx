import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FloatingAdvisor } from "@/components/ai/FloatingAdvisor";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteShell } from "@/components/layout/SiteShell";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "PhoneStore - Điện thoại & phụ kiện chính hãng",
    template: "%s | PhoneStore",
  },
  description: "Mua điện thoại và phụ kiện chính hãng, giá tốt tại PhoneStore.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col antialiased">
        <SiteShell
          advisor={<FloatingAdvisor />}
          footer={<Footer />}
          header={<Header />}
        >
          {children}
        </SiteShell>
      </body>
    </html>
  );
}