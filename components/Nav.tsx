"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import HoverMenu from "@/components/HoverMenu";
import CartPreview from "@/components/CartPreview";
import AccountPreview from "@/components/AccountPreview";

const LINKS = [{ label: "Sklep", href: "/sklep" }];

export default function Nav() {
  const { count } = useCart();
  const { status } = useSession();
  const loggedIn = status === "authenticated";
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // zamknij menu/wyszukiwarkę przy zmianie strony — celowa reakcja na zmianę pathname
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/sklep?q=${encodeURIComponent(q)}` : "/sklep");
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      <nav className="flex h-14 w-full items-center justify-between border-b border-black/10 px-4 text-black md:px-8">
        {/* Lewa strona - Menu (mobile) + Logo + linki (desktop) */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            className="md:hidden"
            aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X size={22} strokeWidth={1.5} />
            ) : (
              <Menu size={22} strokeWidth={1.5} />
            )}
          </button>

          <Link href="/" className="font-bebas text-2xl tracking-wider">
            Tresetmob
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-widest uppercase transition-colors ${
                    active ? "text-black" : "text-black/50 hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Prawa strona - ikonki */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label={searchOpen ? "Zamknij wyszukiwanie" : "Szukaj"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search size={20} strokeWidth={1.5} className="cursor-pointer" />
          </button>

          <HoverMenu
            trigger={
              <Link
                href={loggedIn ? "/konto" : "/logowanie"}
                aria-label={loggedIn ? "Moje konto" : "Logowanie"}
              >
                <User size={20} strokeWidth={1.5} />
              </Link>
            }
          >
            <AccountPreview />
          </HoverMenu>

          <HoverMenu
            trigger={
              <Link
                href="/koszyk"
                aria-label="Koszyk"
                className="relative block"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                    {count}
                  </span>
                )}
              </Link>
            }
          >
            <CartPreview />
          </HoverMenu>
        </div>
      </nav>

      {/* pasek wyszukiwania */}
      {searchOpen && (
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-3 border-b border-black/10 bg-white px-4 py-4 md:px-8"
        >
          <Search size={18} strokeWidth={1.5} className="text-black/40" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj produktów..."
            className="w-full bg-transparent text-sm placeholder:text-black/40 focus:outline-none"
          />
        </form>
      )}

      {/* menu mobilne */}
      {menuOpen && (
        <div className="flex flex-col border-b border-black/10 bg-white px-4 py-4 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-3 text-sm tracking-widest uppercase text-black/80"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
