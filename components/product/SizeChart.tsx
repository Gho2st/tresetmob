"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const ROWS = [
  { size: "28", waist: "71-74", hips: "89-92", inseam: "80" },
  { size: "30", waist: "76-79", hips: "94-97", inseam: "81" },
  { size: "32", waist: "81-84", hips: "99-102", inseam: "82" },
  { size: "34", waist: "86-89", hips: "104-107", inseam: "83" },
  { size: "36", waist: "91-94", hips: "109-112", inseam: "84" },
  { size: "38", waist: "96-99", hips: "114-117", inseam: "85" },
];

export default function SizeChart() {
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
            className="w-full max-w-md bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide uppercase">
                Tablica rozmiarów
              </h2>
              <button
                type="button"
                aria-label="Zamknij"
                onClick={() => setOpen(false)}
                className="text-black/50 hover:text-black"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs tracking-wide text-black/40 uppercase">
                    <th className="py-2 pr-2 font-normal">Rozmiar</th>
                    <th className="py-2 pr-2 font-normal">Talia (cm)</th>
                    <th className="py-2 pr-2 font-normal">Biodra (cm)</th>
                    <th className="py-2 font-normal">Nogawka (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.size} className="border-b border-black/5">
                      <td className="py-2 pr-2 font-semibold">{row.size}</td>
                      <td className="py-2 pr-2 text-black/70">{row.waist}</td>
                      <td className="py-2 pr-2 text-black/70">{row.hips}</td>
                      <td className="py-2 text-black/70">{row.inseam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-black/40">
              Wymiary orientacyjne — mogą się nieznacznie różnić w zależności
              od modelu.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
