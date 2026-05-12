import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /search → /my-dog: 旧「検索ウィザード」を「うちの子から探す」に統合。
      // 機能が同等で、/my-dog のほうが localStorage 復元動線を持つため。
      { source: "/:locale(ja|en)/search", destination: "/:locale/my-dog", permanent: true },
    ];
  },
};

export default nextConfig;
