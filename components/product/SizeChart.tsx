"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { SizeChartData } from "@/lib/size-charts";
import SizeChartTable from "./SizeChartTable";
import { DEFAULT_SIZE_CHART_ILLUSTRATION } from "@/lib/size-chart-defaults";

const DEFAULT_NOTE =
  "Wymiary orientacyjne — mogą się nieznacznie różnić w zależności od modelu.";

export default function SizeChart({ chart }: { chart: SizeChartData }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs tracking-wide text-black/50 underline underline-offset-4 hover:text-black"
      >
        Tablica rozmiarów
      </button>

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold tracking-wide uppercase">
                  Tablica rozmiarów
                </h2>
                <p className="mt-1 text-xs text-black/40">{chart.name}</p>
              </div>
              <button
                type="button"
                aria-label="Zamknij"
                onClick={() => setOpen(false)}
                className="text-black/50 hover:text-black"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="relative mt-5 h-56 w-full sm:h-64">
              <Image
                src={chart.illustration ?? DEFAULT_SIZE_CHART_ILLUSTRATION}
                alt={`Wymiary: ${chart.name}`}
                fill
                sizes="(max-width: 640px) 90vw, 512px"
                className="object-contain"
              />
            </div>

            <div className="mt-5">
              <SizeChartTable sizes={chart.sizes} rows={chart.rows} />
            </div>

            <p className="mt-4 text-xs text-black/40">
              {chart.note ?? DEFAULT_NOTE}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
