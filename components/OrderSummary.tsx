"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { formatPrice, type CartItem } from "@/lib/cart";
import {
  discountAmount as calcDiscountAmount,
  deliveryCost,
  type Discount,
} from "@/lib/discounts";
import { checkDiscountCode } from "@/app/(site)/kasa/actions";
import { useCart } from "@/components/CartProvider";

type OrderSummaryProps = {
  subtotal: number;
  items?: CartItem[];
  children: ReactNode;
};

export default function OrderSummary({
  subtotal,
  items,
  children,
}: OrderSummaryProps) {
  // Kod żyje w koszyku (CartProvider), więc przechodzi z /koszyk do /kasa.
  // Tu trzymamy tylko jego sprawdzoną wersję — kwotę rabatu i sumę i tak
  // przelicza serwer przy składaniu zamówienia.
  const { discountCode, setDiscountCode } = useCart();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<Discount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const discount = applied ? Math.round(calcDiscountAmount(subtotal, applied)) : 0;
  const delivery = deliveryCost(applied);
  const total = Math.max(subtotal - discount, 0) + delivery;

  // Kod zapamiętany w koszyku sprawdzamy ponownie po wejściu na stronę —
  // jednorazowy kod z newslettera mógł się w międzyczasie zużyć.
  useEffect(() => {
    if (!discountCode || applied?.code === discountCode) return;
    let active = true;
    checkDiscountCode(discountCode)
      .catch(() => null)
      .then((found) => {
        if (!active) return;
        setApplied(found);
        if (found) setCode(found.code);
        else setDiscountCode(null);
      });
    return () => {
      active = false;
    };
  }, [discountCode, applied?.code, setDiscountCode]);

  // Kody z newslettera są jednorazowe i leżą w bazie, więc pytamy serwer.
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    const found = await checkDiscountCode(code).catch(() => null);
    setChecking(false);
    if (!found) {
      setApplied(null);
      setError("Nieprawidłowy kod rabatowy");
      setDiscountCode(null);
      return;
    }
    setApplied(found);
    setError(null);
    setDiscountCode(found.code);
  };

  return (
    <div className="flex flex-col gap-6 border border-black/10 p-8">
      <h2 className="text-xs tracking-[0.3em] text-black/40">
        PODSUMOWANIE
      </h2>

      {items && (
        <ul className="flex flex-col gap-4 border-b border-black/10 pb-6">
          {items.map((item) => (
            <li
              key={`${item.slug}-${item.size}`}
              className="flex items-center gap-3 text-sm"
            >
              <div className="relative aspect-square w-12 shrink-0 overflow-hidden bg-neutral-100">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <span className="flex-1 text-black/70">
                {item.title}{" "}
                <span className="text-black/40">
                  ({item.size}) × {item.quantity}
                </span>
              </span>
              <span className="shrink-0">
                {formatPrice(item.priceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleApply} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Kod rabatowy"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="w-full border border-black/20 px-3 py-2 text-sm uppercase placeholder:text-black/30 placeholder:normal-case focus:border-black focus:outline-none"
          />
          <button
            type="submit"
            disabled={checking}
            className="shrink-0 border border-black/30 px-4 text-xs tracking-[0.15em] uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
          >
            Zastosuj
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {applied && (
          <p className="text-xs text-black/50">
            Zastosowano kod „{applied.code}” ({applied.label})
          </p>
        )}
      </form>

      <div className="flex items-center justify-between text-sm">
        <span className="text-black/50">Suma częściowa</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-black/50">Rabat</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="text-black/50">Dostawa</span>
        <span className="text-black/50">
          {formatPrice(delivery)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-black/10 pt-6 text-sm font-semibold">
        <span>Razem</span>
        <span>{formatPrice(total)}</span>
      </div>

      {children}
    </div>
  );
}
