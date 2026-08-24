"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/cart";

export default function CartPreview() {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm text-black/50">Koszyk jest pusty.</p>
        <Link
          href="/kolekcje"
          className="text-xs tracking-widest uppercase underline underline-offset-4 hover:text-black"
        >
          Zobacz kolekcje
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ul className="flex max-h-80 flex-col gap-4 overflow-y-auto p-4">
        {items.map((item) => (
          <li
            key={`${item.slug}-${item.size}`}
            className="flex items-center gap-3"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-neutral-100">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="56px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold tracking-wide uppercase">
                {item.title}
              </p>
              <p className="text-xs text-black/40">
                {item.size} × {item.quantity}
              </p>
            </div>
            <span className="shrink-0 text-xs">
              {formatPrice(item.priceCents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-black/10 px-4 py-3 text-sm">
        <span className="text-black/50">Suma częściowa</span>
        <span className="font-semibold">{formatPrice(subtotal)}</span>
      </div>

      <Link
        href="/koszyk"
        className="block bg-black py-3 text-center text-xs tracking-widest text-white uppercase transition-colors hover:bg-neutral-800"
      >
        Przejdź do koszyka
      </Link>
    </div>
  );
}
