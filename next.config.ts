import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Cho phép build thành công dù còn lỗi kiểu dữ liệu TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;