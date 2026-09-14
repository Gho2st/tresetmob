import Link from "next/link";
import { SOCIAL_HANDLE, SOCIAL_LINKS } from "@/lib/social";
import { SocialIcon } from "@/components/SocialIcons";

const columns = [
  {
    title: "Sklep",
    links: [
      { label: "Produkty", href: "/sklep" },
      { label: "Koszyk", href: "/koszyk" },
    ],
  },
  {
    title: "Obsługa",
    links: [
      { label: "Centrum pomocy", href: "/centrum-pomocy" },
      { label: "Zwroty", href: "/zwroty" },
    ],
  },
  {
    title: "Informacje",
    links: [
      { label: "Regulamin", href: "/regulamin" },
      { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-black text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20 sm:px-12 md:flex-row md:justify-between lg:px-20">
        <div className="flex flex-col gap-5">
          <Link href="/" className="font-bebas text-3xl tracking-wide">
            Tresetmob
          </Link>
          {/* <p className="max-w-2xs text-sm leading-relaxed text-white/50">
            Born in Poland
          </p> */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${social.label} @${SOCIAL_HANDLE}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white hover:bg-white hover:text-black"
              >
                <SocialIcon id={social.id} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-12 sm:grid-cols-3 sm:gap-x-16">
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <span className="text-xs tracking-[0.3em] text-white/40">
                {column.title.toUpperCase()}
              </span>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col-reverse gap-2 px-6 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-12 lg:px-20">
          <span>© {year} Tresetmob. Wszelkie prawa zastrzeżone.</span>
          <span className="tracking-[0.2em]">MADE IN POLAND</span>
        </div>
      </div>
    </footer>
  );
}
