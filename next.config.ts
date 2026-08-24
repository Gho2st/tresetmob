import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // domyślny limit to 1MB — zdjęcia produktowe wgrywane przez admina bywają większe
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
