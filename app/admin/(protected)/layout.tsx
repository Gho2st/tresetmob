import Link from "next/link";
import { ExternalLink, Wrench } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "@/auth";
import { getShopSettings } from "@/lib/shop-settings";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const { maintenance } = await getShopSettings();

  const logout = (
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
  );

  return (
    <div className="min-h-screen bg-white text-black lg:flex">
      {/* Na telefonie pasek u góry z przewijaną w poziomie nawigacją, na
          szerokim ekranie stały panel boczny. */}
      <aside className="flex flex-col gap-4 border-b border-black/10 px-4 pt-4 pb-3 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:gap-8 lg:border-r lg:border-b-0 lg:px-5 lg:py-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" className="font-display text-xl tracking-wider">
            Tresetmob <span className="text-black/40">Admin</span>
          </Link>
          <div className="lg:hidden">{logout}</div>
        </div>

        <AdminNav />

        <div className="hidden flex-col gap-4 lg:mt-auto lg:flex">
          {maintenance && (
            <Link
              href="/admin/ustawienia"
              className="flex items-start gap-2 border border-amber-600/40 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800"
            >
              <Wrench aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Tryb prac technicznych jest włączony — kasa zablokowana dla klientów.
            </Link>
          )}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-black/50 transition-colors hover:text-black"
          >
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            Otwórz sklep
          </Link>
          <div className="flex flex-col gap-3 border-t border-black/10 pt-4">
            <span className="truncate text-xs text-black/40">{session?.user?.email}</span>
            <div>{logout}</div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {maintenance && (
          <Link
            href="/admin/ustawienia"
            className="flex items-center gap-2 border-b border-amber-600/30 bg-amber-50 px-4 py-2 text-xs text-amber-800 lg:hidden"
          >
            <Wrench aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            Tryb prac technicznych włączony
          </Link>
        )}
        <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
