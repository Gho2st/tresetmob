"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import HoverMenu from "@/components/HoverMenu";
import CartPreview from "@/components/CartPreview";
import AccountPreview from "@/components/AccountPreview";

const LINKS = [{ label: "Sklep", href: "/sklep" }];

const iconBtn =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black " +
  "transition-colors active:bg-black/5 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-black/20";

export default function Nav() {
  const { count } = useCart();
  const { status } = useSession();
  const loggedIn = status === "authenticated";
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

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

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // trasy z menu pobierane z wyprzedzeniem, zanim ktokolwiek kliknie
    LINKS.forEach((link) => router.prefetch(link.href));
    router.prefetch("/koszyk");
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const toggleMenu = () => {
    setSearchOpen(false);
    setMenuOpen((v) => !v);
  };

  const toggleSearch = () => {
    setMenuOpen(false);
    setSearchOpen((v) => !v);
  };

  // panel zamyka się od razu po dotknięciu, nie po załadowaniu trasy
  const navigate =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      e.preventDefault();
      closeAll();
      startTransition(() => router.push(href));
    };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    const href = q ? `/sklep?q=${encodeURIComponent(q)}` : "/sklep";
    closeAll();
    setQuery("");
    startTransition(() => router.push(href));
  };

  const badge = count > 9 ? "9+" : count;

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.07)]" : ""
      }`}
      aria-busy={isPending}
    >
      <nav className="relative flex h-14 w-full items-center justify-between border-b border-black/10 px-2 text-black md:px-8">
        <div className="flex items-center gap-8">
          <button
            type="button"
            className={`${iconBtn} md:hidden`}
            aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={toggleMenu}
          >
            {menuOpen ? (
              <X size={22} strokeWidth={1.5} />
            ) : (
              <Menu size={22} strokeWidth={1.5} />
            )}
          </button>

          <Link
            href="/"
            onClick={navigate("/")}
            aria-label="Strona główna"
            className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center md:static md:translate-x-0 md:translate-y-0"
          >
            <Image
              src="/logo.png"
              alt="Tresetmob"
              width={140}
              height={36}
              className="h-7 w-auto md:h-8"
              priority
            />
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={navigate(link.href)}
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

        <div className="flex items-center gap-0.5 md:gap-3">
          <button
            type="button"
            className={iconBtn}
            aria-label={searchOpen ? "Zamknij wyszukiwanie" : "Szukaj"}
            aria-expanded={searchOpen}
            aria-controls="site-search"
            onClick={toggleSearch}
          >
            {searchOpen ? (
              <X size={20} strokeWidth={1.5} />
            ) : (
              <Search size={20} strokeWidth={1.5} />
            )}
          </button>

          <div className="hidden md:block">
            <HoverMenu
              trigger={
                <Link
                  href={loggedIn ? "/konto" : "/logowanie"}
                  onClick={navigate(loggedIn ? "/konto" : "/logowanie")}
                  aria-label={loggedIn ? "Moje konto" : "Logowanie"}
                  className={iconBtn}
                >
                  <User size={20} strokeWidth={1.5} />
                </Link>
              }
            >
              <AccountPreview />
            </HoverMenu>
          </div>

          <Link
            href="/koszyk"
            onClick={navigate("/koszyk")}
            aria-label={`Koszyk${count > 0 ? `, produkty: ${count}` : ""}`}
            className={`${iconBtn} relative md:hidden`}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] leading-none text-white">
                {badge}
              </span>
            )}
          </Link>

          <div className="hidden md:block">
            <HoverMenu
              trigger={
                <Link
                  href="/koszyk"
                  onClick={navigate("/koszyk")}
                  aria-label={`Koszyk${count > 0 ? `, produkty: ${count}` : ""}`}
                  className={`${iconBtn} relative`}
                >
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  {count > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] leading-none text-white">
                      {badge}
                    </span>
                  )}
                </Link>
              }
            >
              <CartPreview />
            </HoverMenu>
          </div>
        </div>

        {isPending && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 overflow-hidden"
          >
            <span className="block h-full w-1/3 animate-[nav-progress_1.1s_ease-in-out_infinite] bg-black" />
          </span>
        )}
      </nav>

      {searchOpen && (
        <form
          id="site-search"
          onSubmit={handleSearch}
          className="flex items-center gap-3 border-b border-black/10 bg-white px-4 py-3 md:px-8"
        >
          <Search
            size={18}
            strokeWidth={1.5}
            className="shrink-0 text-black/40"
          />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj produktów..."
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            className="w-full bg-transparent text-base placeholder:text-black/40 focus:outline-none md:text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Wyczyść"
              className="shrink-0 text-black/40"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          )}
          <button
            type="submit"
            className="shrink-0 text-sm whitespace-nowrap text-black/60 md:hidden"
          >
            Szukaj
          </button>
        </form>
      )}

      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-white transition-[opacity,transform] duration-200 md:hidden ${
          menuOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col px-4 pt-2">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={navigate(link.href)}
                className={`-mx-2 border-b border-black/5 px-2 py-4 text-base tracking-widest uppercase transition-colors active:bg-black/5 ${
                  active ? "text-black" : "text-black/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-1 px-4 pt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <Link
            href={loggedIn ? "/konto" : "/logowanie"}
            onClick={navigate(loggedIn ? "/konto" : "/logowanie")}
            className="-mx-2 flex items-center gap-3 rounded px-2 py-3 text-sm text-black/70 transition-colors active:bg-black/5"
          >
            <User size={18} strokeWidth={1.5} />
            {loggedIn ? "Moje konto" : "Zaloguj się"}
          </Link>
          <Link
            href="/koszyk"
            onClick={navigate("/koszyk")}
            className="-mx-2 flex items-center gap-3 rounded px-2 py-3 text-sm text-black/70 transition-colors active:bg-black/5"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            Koszyk{count > 0 ? ` (${count})` : ""}
          </Link>
        </div>
      </div>
    </header>
  );
}
