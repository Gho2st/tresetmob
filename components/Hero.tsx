import Image from "next/image";
import Link from "next/link";
import { getHeroMedia } from "@/lib/hero";

export default async function Hero() {
  const heroMedia = await getHeroMedia();

  return (
    <div className="w-full h-screen relative">
      {heroMedia.type === "video" ? (
        <video
          src={heroMedia.src}
          poster={heroMedia.poster}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Image
          src={heroMedia.src}
          alt={heroMedia.alt ?? ""}
          fill
          priority
          className="object-cover"
        />
      )}

      {/* Przezroczysty przycisk ginie na jasnym kadrze, więc lekko przyciemniamy tło. */}
      <div className="absolute inset-0 bg-black/25" />

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <Link
          href="/sklep"
          className="border border-white bg-transparent text-white px-8 py-3 text-sm font-semibold tracking-wider
                     hover:bg-white hover:text-black transition-colors"
        >
          SHOP NOW
        </Link>
      </div>
    </div>
  );
}
