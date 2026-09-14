"use client";

import { useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SORT_OPTIONS,
  buildCatalogHref,
  type CatalogParams,
  type SortValue,
} from "@/lib/catalog";

type CatalogFiltersProps = {
  sizes: string[];
  params: CatalogParams;
  children: React.ReactNode;
};

export default function CatalogFilters({ sizes, params, children }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // optymistycznie, żeby szybkie klikanie kilku filtrów pod rząd nie gubiło zmian
  const [current, setCurrent] = useOptimistic(params);
  const [panelOpen, setPanelOpen] = useState(false);

  const activeCount = current.sizes.length;

  const navigate = (patch: Partial<CatalogParams>) => {
    const next = { ...current, ...patch };
    startTransition(() => {
      setCurrent(next);
      router.push(buildCatalogHref(pathname, next), { scroll: false });
    });
  };

  const toggleSize = (size: string) => {
    navigate({
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((s) => s !== size)
        : [...current.sizes, size],
    });
  };

  const filterControls = (
    <div className="flex flex-col gap-5 md:flex-row md:flex-wrap md:items-center md:gap-8">
      {sizes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs tracking-[0.2em] text-black/40 uppercase">
            Rozmiar
          </span>
          {sizes.map((size) => {
            const selected = current.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleSize(size)}
                className={`min-w-10 border px-3 py-1.5 text-xs uppercase transition-colors ${
                  selected
                    ? "border-black bg-black text-white"
                    : "border-black/20 hover:border-black"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      )}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => navigate({ sizes: [] })}
          className="w-fit text-xs tracking-[0.2em] text-black/50 uppercase underline underline-offset-4 hover:text-black"
        >
          Wyczyść
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="border-y border-black/10">
        <div className="flex items-center justify-between gap-4 py-4">
          <button
            type="button"
            onClick={() => setPanelOpen((open) => !open)}
            aria-expanded={panelOpen}
            className="text-xs tracking-[0.2em] uppercase md:hidden"
          >
            Filtry{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>

          <div className="hidden md:block">{filterControls}</div>

          <label className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs tracking-[0.2em] text-black/40 uppercase sm:inline">
              Sortuj
            </span>
            <select
              aria-label="Sortuj produkty"
              value={current.sort}
              onChange={(e) => navigate({ sort: e.target.value as SortValue })}
              className="border border-black/20 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {panelOpen && (
          <div className="border-t border-black/10 py-5 md:hidden">
            {filterControls}
          </div>
        )}
      </div>

      <div
        aria-busy={isPending}
        className={`transition-opacity duration-200 ${isPending ? "opacity-40" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
