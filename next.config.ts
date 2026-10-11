import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      // Zdjęcia postów z Instagrama — adresy są podpisane i wygasają, więc
      // pobieramy je świeże przy każdej regeneracji sekcji socialowej.
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
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
