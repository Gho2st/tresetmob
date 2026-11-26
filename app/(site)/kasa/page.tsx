import Link from "next/link";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-credentials";
import { getShopSettings } from "@/lib/shop-settings";
import Checkout from "./Checkout";

export default async function Kasa() {
  const { maintenance, maintenanceMessage } = await getShopSettings();
  // Admin przechodzi dalej, żeby w czasie prac móc testować płatności.
  const session = maintenance ? await auth() : null;

  if (maintenance && !isAdminEmail(session?.user?.email)) {
    return (
      <section className="flex min-h-[calc(100svh-3.5rem)] w-full flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
        <span className="text-xs tracking-[0.3em] text-black/40">KASA</span>
        <h1 className="font-display text-5xl uppercase tracking-tight">
          Prace techniczne
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-black/50">
          {maintenanceMessage} Twój koszyk zostanie zapamiętany.
        </p>
        <Link
          href="/sklep"
          className="mt-4 inline-flex w-fit items-center gap-3 border border-black/30 px-7 py-4 text-sm tracking-[0.15em] transition-colors hover:border-black hover:bg-black hover:text-white"
        >
          WRÓĆ DO SKLEPU
        </Link>
      </section>
    );
  }

  return <Checkout />;
}
