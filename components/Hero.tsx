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

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <Link
          href="/kolekcje"
          className="bg-white text-black px-8 py-3 text-sm font-semibold tracking-wider
                     hover:bg-black hover:text-white transition-colors"
        >
          SHOP NOW
        </Link>
      </div>
    </div>
  );
}
