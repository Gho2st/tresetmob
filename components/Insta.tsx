import Image from "next/image";
import { SOCIAL_HANDLE, SOCIAL_LINKS } from "@/lib/social";
import { SocialIcon } from "@/components/SocialIcons";
import { getLatestInstagramPost } from "@/lib/instagram";

const DESCRIPTIONS = {
  instagram: "Świeże kadry i nowości",
  tiktok: "Kulisy i krótkie filmy",
} as const;

export default async function Insta() {
  // Brak tokenu, wygasły token albo awaria API dają null — wtedy zostaje kadr
  // z repozytorium i sekcja wygląda dokładnie jak przedtem.
  const post = await getLatestInstagramPost();

  return (
    <section
      aria-labelledby="social-heading"
      className="xl:my-24 mx-auto flex w-full max-w-[1280px] flex-col bg-black text-white lg:min-h-[420px] lg:flex-row 2xl:max-w-[1440px]"
    >
      {/* ---------- zdjęcie ---------- */}
      <figure className="group relative m-0 aspect-square w-full overflow-hidden lg:aspect-auto lg:w-[54%] lg:self-stretch 2xl:w-[58%]">
        <Image
          src={post?.imageUrl ?? "/insta.png"}
          alt={
            post
              ? `Najnowszy post z profilu @${SOCIAL_HANDLE}`
              : "Kadr z profilu @tresetmob"
          }
          fill
          sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 54vw, 58vw"
          className="object-contain"
          priority
        />

        {/* scrim pod podpisem, żeby biały tekst zawsze był czytelny */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
        />

        {/* Kadr prowadzi na konkretny post tylko wtedy, gdy mamy go z API —
            link do zdjęcia z repozytorium nie miałby celu. */}
        {post && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Zobacz najnowszy post na Instagramie"
            className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          />
        )}

        <figcaption className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 p-4 sm:p-5">
          <span className="font-display text-lg leading-none tracking-wide">
            @{SOCIAL_HANDLE}
          </span>
        </figcaption>
      </figure>

      {/* ---------- treść ---------- */}
      <div className="flex w-full lg:w-[46%] 2xl:w-[42%]">
        {/* kolumna tekstowa ma własną szerokość, żeby na szerokich ekranach
            nie rozjeżdżała się na całą połówkę sekcji */}
        <div className="flex w-full max-w-[460px] flex-col justify-between gap-8 px-5 py-8 sm:px-7 lg:px-10 lg:py-9 2xl:max-w-[520px] 2xl:px-12 2xl:py-11">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 text-[0.65rem] tracking-[0.25em] text-white/35">
              <span aria-hidden="true" className="h-px w-8 bg-white/25" />
            </div>
            <h2
              id="social-heading"
              className="font-display text-[clamp(1.875rem,2.6vw,3rem)] uppercase leading-[0.9] tracking-[-0.01em]"
            >
              <span className="block">Reszta</span>
              <span className="block">dzieje się</span>
              <span
                className="block text-transparent"
                style={{ WebkitTextStroke: "1px rgba(255,255,255,0.85)" }}
              >
                w socialach
              </span>
            </h2>

            {post?.caption ? (
              <div className="flex flex-col gap-2">
                {/* Opisy na Instagramie bywają bardzo długie, więc przycinamy
                    je do dwóch linii — całość jest klik dalej, na poście. */}
                <p className="line-clamp-2 max-w-[36ch] text-[0.78rem] leading-[1.65] text-white/55">
                  {post.caption}
                </p>
                <span className="text-[0.65rem] tracking-[0.2em] text-white/30 uppercase">
                  {new Date(post.timestamp).toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            ) : (
              <p className="max-w-[36ch] text-[0.78rem] leading-[1.65] text-white/55">
                Zdjęcia z ostatnich sesji lecą na Instagram, a wszystko, co
                dzieje się obok kadru, trafia na TikToka.
              </p>
            )}
          </div>

          {/* na mobile lista idzie na pełną szerokość, na desktopie
              trzyma się tej samej osi co nagłówek */}
          <ul className="-mx-5 border-t border-white/15 sm:-mx-7 lg:-mx-4">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.id} className="border-b border-white/15">
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link relative isolate flex items-center gap-4 px-5 py-3.5 transition-colors duration-300 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white sm:px-7 lg:px-4"
                >
                  {/* wypełnienie wjeżdżające od lewej */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 origin-left scale-x-0 bg-white transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/link:scale-x-100 motion-reduce:transition-none"
                  />

                  <SocialIcon
                    id={social.id}
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />

                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-display text-base leading-none tracking-wide 2xl:text-lg">
                      {social.label}
                    </span>
                    <span className="mt-1 truncate text-[0.68rem] text-white/45 transition-colors duration-300 group-hover/link:text-black/55">
                      {DESCRIPTIONS[social.id]}
                    </span>
                  </span>

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover/link:-translate-y-1 group-hover/link:translate-x-1 motion-reduce:transition-none"
                  >
                    <path
                      d="M7 17 17 7M8 7h9v9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="square"
                    />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
