import Image from "next/image";
import { SOCIAL_HANDLE, SOCIAL_LINKS } from "@/lib/social";
import { SocialIcon } from "@/components/SocialIcons";

const DESCRIPTIONS = {
  instagram: "Kadry i nowości",
  tiktok: "Kulisy i krótkie filmy",
} as const;

export default function Insta() {
  return (
    <section
      aria-labelledby="social-heading"
      className="group flex w-full flex-col bg-white text-black lg:h-screen lg:flex-row"
    >
      {/* ---------- zdjęcie ---------- */}
      <div className="relative h-[70vh] w-full overflow-hidden lg:h-full lg:w-1/2">
        <Image
          src="/ig.png"
          alt="Kadr z profilu @tresetmob"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          priority
        />

        <div className="absolute bottom-6 left-6 flex items-center gap-2.5 bg-white px-3 py-2">
          {SOCIAL_LINKS.map((social) => (
            <SocialIcon key={social.id} id={social.id} className="h-3.5 w-3.5" />
          ))}
          <span className="text-xs tracking-[0.15em]">@{SOCIAL_HANDLE}</span>
        </div>
      </div>

      {/* ---------- treść ---------- */}
      <div className="flex w-full flex-col justify-center gap-10 border-t border-black/10 px-6 py-16 sm:px-12 lg:w-1/2 lg:border-t-0 lg:border-l lg:px-20">
        <div className="flex items-center gap-4">
          <span className="text-xs tracking-[0.3em] text-black/40">04</span>
          <span className="h-px max-w-16 flex-1 bg-black/20" />
          <span className="text-xs tracking-[0.3em] text-black/40">SOCIAL</span>
        </div>

        <h2
          id="social-heading"
          className="font-bebas text-6xl uppercase leading-[0.85] tracking-tight sm:text-7xl lg:text-8xl"
        >
          Reszta
          <br />
          dzieje się
          <br />
          w socialach
        </h2>

        <p className="max-w-xs text-sm leading-relaxed text-black/50">
          Świeże kadry na Instagramie, kulisy i krótkie filmy na TikToku.
        </p>

        <ul className="flex max-w-md flex-col border-b border-black/10">
          {SOCIAL_LINKS.map((social) => (
            <li key={social.id} className="border-t border-black/10">
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link flex items-center gap-4 py-5"
              >
                <SocialIcon id={social.id} className="h-5 w-5 shrink-0" />
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm tracking-[0.15em] uppercase">
                    {social.label}
                  </span>
                  <span className="text-xs text-black/40">
                    {DESCRIPTIONS[social.id]}
                  </span>
                </span>
                <span className="hidden text-xs tracking-[0.15em] text-black/40 sm:inline">
                  @{SOCIAL_HANDLE}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/30 transition-all duration-300 group-hover/link:border-black group-hover/link:bg-black group-hover/link:text-white">
                  <span
                    aria-hidden="true"
                    className="text-sm transition-transform duration-300 group-hover/link:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
