"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { GEOWIDGET, toInPostPoint, type InPostPoint } from "@/lib/delivery";

// Widget wywołuje funkcję globalną po nazwie podanej w atrybucie `onpoint`,
// więc nazwa musi być stała i unikalna w skali strony.
const CALLBACK_NAME = "tresetmobInPostPointSelected";

// Skrypt i style InPostu ładujemy dopiero przy pierwszym otwarciu mapy i tylko
// raz na sesję — nie ma po co obciążać nimi każdego wejścia do kasy.
let assetsPromise: Promise<void> | null = null;

function loadGeowidgetAssets() {
  if (assetsPromise) return assetsPromise;

  assetsPromise = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${GEOWIDGET.css}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = GEOWIDGET.css;
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = GEOWIDGET.js;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Bez wyzerowania kolejne otwarcie mapy dostałoby tę samą odrzuconą
      // obietnicę i nigdy nie spróbowałoby wczytać skryptu ponownie.
      assetsPromise = null;
      script.remove();
      reject(new Error("Nie udało się wczytać mapy InPost."));
    };
    document.head.appendChild(script);
  });

  return assetsPromise;
}

type Props = {
  value: InPostPoint | null;
  onSelect: (point: InPostPoint) => void;
};

const inputClass =
  "border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none";

export default function InPostGeowidget({ value, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const onSelectRef = useRef(onSelect);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Status ustawiamy przy otwieraniu, a nie w efekcie — po nieudanym wczytaniu
  // kolejne otwarcie mapy ma zacząć od nowa, a nie zostać na komunikacie błędu.
  const openMap = () => {
    setStatus("loading");
    setOpen(true);
  };

  useEffect(() => {
    const target = window as unknown as Record<string, unknown>;
    target[CALLBACK_NAME] = (raw: unknown) => {
      const point = toInPostPoint(raw);
      if (!point) return;
      onSelectRef.current(point);
      setOpen(false);
    };
    return () => {
      delete target[CALLBACK_NAME];
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    let active = true;
    loadGeowidgetAssets().then(
      () => active && setStatus("ready"),
      () => active && setStatus("error"),
    );

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      active = false;
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Element <inpost-geowidget> wstawiamy ręcznie, a nie w JSX: React dla web
  // componentów część propsów ustawia jako właściwości, a te zaczynające się od
  // "on" traktuje jak zdarzenia — `onpoint` musi dotrzeć do widgetu dosłownie,
  // jako atrybut z nazwą funkcji globalnej.
  useEffect(() => {
    const container = mapRef.current;
    if (!open || status !== "ready" || !container) return;

    const widget = document.createElement("inpost-geowidget");
    widget.setAttribute("token", GEOWIDGET.token);
    widget.setAttribute("language", GEOWIDGET.language);
    widget.setAttribute("config", GEOWIDGET.config);
    widget.setAttribute("onpoint", CALLBACK_NAME);
    widget.style.display = "block";
    widget.style.width = "100%";
    widget.style.height = "100%";
    container.appendChild(widget);

    return () => {
      container.replaceChildren();
    };
  }, [open, status]);

  // Bez tokenu mapy nie da się wyświetlić — zamiast blokować zamówienie
  // pozwalamy wpisać kod paczkomatu ręcznie.
  if (!GEOWIDGET.token) {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={value?.name ?? ""}
          onChange={(e) =>
            onSelect({ name: e.target.value.toUpperCase().trim(), address: "" })
          }
          placeholder="Kod paczkomatu, np. KRA010"
          className={inputClass}
        />
        <p className="text-xs text-black/40">
          Mapa paczkomatów wymaga tokenu InPost — na razie wpisz kod ręcznie.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <div className="flex items-start justify-between gap-4 border border-black px-4 py-3">
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-semibold">
              Paczkomat {value.name}
            </span>
            {value.address && (
              <span className="text-xs text-black/50">{value.address}</span>
            )}
          </span>
          <button
            type="button"
            onClick={openMap}
            className="shrink-0 text-xs tracking-wide underline underline-offset-4 hover:text-black/60"
          >
            Zmień
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openMap}
          className="flex items-center justify-center gap-3 border border-black/20 px-4 py-3 text-sm transition-colors hover:border-black"
        >
          <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
          Wybierz paczkomat na mapie
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-0 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Wybierz paczkomat"
            className="flex h-full w-full max-w-4xl flex-col bg-white sm:h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
              <h2 className="text-sm font-semibold tracking-wide uppercase">
                Wybierz paczkomat
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

            <div className="relative flex-1 overflow-hidden">
              <div ref={mapRef} className="h-full w-full" />
              {status !== "ready" && (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-black/50">
                  {status === "loading"
                    ? "Wczytywanie mapy paczkomatów…"
                    : "Nie udało się wczytać mapy. Sprawdź połączenie i spróbuj ponownie."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
