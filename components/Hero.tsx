import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="w-full h-screen relative">
      <Image src="/hero.png" alt="" fill priority className="object-cover" />

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
