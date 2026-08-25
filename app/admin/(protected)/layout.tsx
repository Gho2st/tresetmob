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
      <header className="flex h-14 items-center justify-between border-b border-black/10 px-6">
        <div className="flex items-center gap-8">
          <Link href="/admin/produkty" className="font-bebas text-xl tracking-wider">
            Tresetmob — Admin
          </Link>
          <nav className="flex items-center gap-6 text-sm uppercase tracking-widest">
            <Link href="/admin/produkty" className="text-black/70 hover:text-black">
              Produkty
            </Link>
            <Link href="/admin/zamowienia" className="text-black/70 hover:text-black">
              Zamówienia
            </Link>
            <Link href="/admin/hero" className="text-black/70 hover:text-black">
              Hero
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm text-black/50">
          <span>{session?.user?.email}</span>
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
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
