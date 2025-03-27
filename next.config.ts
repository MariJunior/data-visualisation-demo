import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ant-design", "antd"],
  reactStrictMode: true,
};

export default nextConfig;
