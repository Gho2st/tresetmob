"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/lib/products";

export default function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const inStock = product.variants.some((v) => v.stock > 0);
  const effectivePriceCents = product.salePriceCents ?? product.priceCents;

  const handleAdd = () => {
    if (!size) return;
    addItem({
      slug: product.slug,
      title: product.title,
      priceCents: effectivePriceCents,
      image: product.images[0],
      size,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <div className="mt-8">
        <span className="text-xs tracking-wide uppercase">Rozmiar</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.size}
              type="button"
              disabled={v.stock === 0}
              onClick={() => setSize(v.size)}
              aria-pressed={size === v.size}
              className={`border px-4 py-2 text-sm transition-colors ${
                v.stock === 0
                  ? "cursor-not-allowed border-neutral-200 text-black/30 line-through"
                  : size === v.size
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 hover:border-black"
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>

      {inStock ? (
        <button
          type="button"
          onClick={handleAdd}
          disabled={!size}
          className="mt-8 w-full bg-black py-4 text-sm tracking-wide text-white uppercase transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {added ? "Dodano" : "Dodaj do koszyka"}
        </button>
      ) : (
        <p className="mt-8 w-full border border-black/20 py-4 text-center text-sm tracking-wide text-black/50 uppercase">
          Brak w magazynie
        </p>
      )}
    </>
  );
}
