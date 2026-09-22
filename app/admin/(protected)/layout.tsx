import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Na telefonie nagłówek rozkłada się na dwa rzędy: marka z wylogowaniem,
          a pod nimi nawigacja. Kolejność zmieniamy klasami `order-*`, żeby na
          szerokim ekranie wrócił jeden pasek bez powielania formularza. */}
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-black/10 px-4 py-3 sm:h-14 sm:flex-nowrap sm:gap-x-8 sm:py-0 md:px-6">
        <Link
          href="/admin/produkty"
          className="order-1 font-bebas text-xl tracking-wider"
        >
          Tresetmob — Admin
        </Link>

        <div className="order-2 ml-auto flex items-center gap-4 text-sm text-black/50 sm:order-3">
          <span className="hidden max-w-[22ch] truncate lg:inline">
            {session?.user?.email}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="border border-black/20 px-4 py-1.5 text-xs tracking-widest uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
            >
              Wyloguj
            </button>
          </form>
        </div>

        <nav className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-xs tracking-widest uppercase sm:order-2 sm:w-auto sm:gap-x-6 sm:text-sm">
          <Link href="/admin/produkty" className="text-black/70 hover:text-black">
            Produkty
          </Link>
          <Link
            href="/admin/tabele-rozmiarow"
            className="text-black/70 hover:text-black"
          >
            Tabele rozmiarów
          </Link>
          <Link href="/admin/zamowienia" className="text-black/70 hover:text-black">
            Zamówienia
          </Link>
          <Link href="/admin/hero" className="text-black/70 hover:text-black">
            Hero
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">{children}</main>
    </div>
  );
}
