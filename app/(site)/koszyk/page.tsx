"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/cart";
import OrderSummary from "@/components/OrderSummary";

export default function Koszyk() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <section className="flex min-h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
        <span className="text-xs tracking-[0.3em] text-black/40">
          KOSZYK
        </span>
        <h1 className="font-bebas text-5xl uppercase tracking-tight">
          Koszyk jest pusty
        </h1>
        <p className="max-w-xs text-sm leading-relaxed text-black/50">
          Przejrzyj kolekcje i dodaj coś, co Ci się spodoba.
        </p>
        <Link
          href="/sklep"
          className="mt-4 inline-flex w-fit items-center gap-3 border border-black/30 px-7 py-4 text-sm tracking-[0.15em] transition-colors hover:border-black hover:bg-black hover:text-white"
        >
          ZOBACZ KOLEKCJE
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 bg-white px-6 py-16 text-black sm:px-12 lg:flex-row lg:items-start lg:gap-20 lg:px-20 lg:py-20">
      <div className="flex-1">
        <div className="mb-10 flex flex-col gap-3">
          <span className="text-xs tracking-[0.3em] text-black/40">
            KOSZYK
          </span>
          <h1 className="font-bebas text-5xl uppercase tracking-tight">
            Twoje produkty
          </h1>
        </div>

        <ul className="flex flex-col divide-y divide-black/10 border-y border-black/10">
          {items.map((item) => (
            <li
              key={`${item.slug}-${item.size}`}
              className="flex gap-5 py-6 sm:gap-8"
            >
              <div className="relative aspect-square w-24 shrink-0 bg-neutral-100 sm:w-32">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="128px"
                  className="object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wide">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-xs text-black/40">
                      Rozmiar {item.size}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug, item.size)}
                    aria-label="Usuń z koszyka"
                    className="text-xs tracking-[0.15em] text-black/40 underline underline-offset-4 transition-colors hover:text-black"
                  >
                    USUŃ
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-black/20">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.slug, item.size, item.quantity - 1)
                      }
                      aria-label="Zmniejsz ilość"
                      className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-black hover:text-white"
                    >
                      −
                    </button>
                    <span className="flex h-9 w-9 items-center justify-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.slug, item.size, item.quantity + 1)
                      }
                      aria-label="Zwiększ ilość"
                      className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-black hover:text-white"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full shrink-0 lg:w-80">
        <OrderSummary subtotal={subtotal}>
          <Link
            href="/kasa"
            className="mt-2 flex w-full items-center justify-center bg-black py-4 text-sm tracking-[0.15em] text-white uppercase transition-colors hover:bg-neutral-800"
          >
            Przejdź do kasy
          </Link>
        </OrderSummary>
      </div>
    </section>
  );
}
