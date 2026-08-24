"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { formatPrice, type CartItem } from "@/lib/cart";
import { findDiscount, discountAmount as calcDiscountAmount } from "@/lib/discounts";

type OrderSummaryProps = {
  subtotal: number;
  shippingLabel?: string;
  items?: CartItem[];
  onTotalChange?: (total: number) => void;
  children: ReactNode;
};

export default function OrderSummary({
  subtotal,
  shippingLabel = "Obliczana przy kasie",
  items,
  onTotalChange,
  children,
}: OrderSummaryProps) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<ReturnType<typeof findDiscount>>(null);
  const [error, setError] = useState<string | null>(null);

  const discount = applied ? calcDiscountAmount(subtotal, applied) : 0;
  const total = Math.max(subtotal - discount, 0);

  useEffect(() => {
    onTotalChange?.(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const found = findDiscount(code);
    if (!found) {
      setApplied(null);
      setError("Nieprawidłowy kod rabatowy");
      return;
    }
    setApplied(found);
    setError(null);
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
            className="w-full border border-black/20 px-3 py-2 text-sm uppercase placeholder:text-black/30 placeholder:normal-case focus:border-black focus:outline-none"
          />
          <button
            type="submit"
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
      {applied && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-black/50">Rabat</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="text-black/50">Dostawa</span>
        <span className="text-black/50">{shippingLabel}</span>
      </div>

      <div className="flex items-center justify-between border-t border-black/10 pt-6 text-sm font-semibold">
        <span>Razem</span>
        <span>{formatPrice(total)}</span>
      </div>

      {children}
    </div>
  );
}
