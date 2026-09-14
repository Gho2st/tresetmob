import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/customer";
import { getOrdersForEmail } from "@/lib/orders";
import { formatPrice } from "@/lib/cart";

export default async function MojeZamowienia() {
  const session = await requireUser();
  const orders = await getOrdersForEmail(session.user!.email!);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 bg-white px-6 py-16 text-black sm:px-12 lg:px-0 lg:py-24">
      <div className="flex flex-col gap-3">
        <Link
          href="/konto"
          className="w-fit text-xs tracking-[0.15em] text-black/40 underline underline-offset-4 hover:text-black"
        >
          ← Moje konto
        </Link>
        <span className="text-xs tracking-[0.3em] text-black/40">
          HISTORIA
        </span>
        <h1 className="font-bebas text-5xl uppercase tracking-tight">
          Moje zamówienia
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-black/50">Nie masz jeszcze żadnych zamówień.</p>
          <Link
            href="/sklep"
            className="inline-flex w-fit items-center gap-3 border border-black/30 px-7 py-4 text-sm tracking-[0.15em] uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
          >
            Zobacz kolekcje
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-black/10 border-y border-black/10">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-col gap-4 py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-semibold tracking-wide uppercase">
                  {order.number}
                </span>
                <span className="text-xs text-black/40">
                  {order.createdAt.toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="relative h-14 w-14 shrink-0 overflow-hidden bg-neutral-100"
                    title={`${item.title} (${item.size}) × ${item.quantity}`}
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="border border-black/20 px-3 py-1 text-xs tracking-widest uppercase">
                  {order.status}
                </span>
                <span className="font-semibold">
                  {formatPrice(order.totalCents)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
