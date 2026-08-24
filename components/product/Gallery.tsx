"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  title: string;
};

export default function Gallery({ images, title }: Props) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const open = (index: number) => {
    setActive(index);
    setLightboxOpen(true);
  };

  const showPrev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setActive((i) => (i + 1) % images.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    // blokada scrolla tła pod lightboxem
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // showPrev/showNext celowo pominięte - nie są memoizowane, a zależy nam
    // tylko na (od)montowaniu listenera przy otwarciu/zamknięciu lightboxa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="flex flex-col gap-2">
      {/* mobile: przesuwany slider */}
      <div className="md:hidden">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="flex snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((src, i) => (
            <button
              type="button"
              key={src}
              onClick={() => open(i)}
              className="relative aspect-3/4 w-full flex-none snap-start bg-neutral-100"
              aria-label={`Powiększ zdjęcie ${i + 1}`}
            >
              <Image
                src={src}
                alt={i === 0 ? title : ""}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-contain"
              />
            </button>
          ))}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((src, i) => (
              <span
                key={src}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === active ? "bg-black" : "bg-black/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* desktop: kolumna zdjęć, klik powiększa */}
      <div className="hidden md:flex md:flex-col md:gap-2">
        {images.map((src, i) => (
          <button
            type="button"
            key={src}
            onClick={() => open(i)}
            className="relative aspect-3/4 w-full cursor-zoom-in bg-neutral-100"
            aria-label={`Powiększ zdjęcie ${i + 1}`}
          >
            <Image
              src={src}
              alt={i === 0 ? title : ""}
              fill
              priority={i === 0}
              sizes="50vw"
              className="object-contain"
            />
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/95"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Zamknij"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={28} strokeWidth={1.5} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Poprzednie zdjęcie"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white md:left-6"
              >
                <ChevronLeft size={32} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label="Następne zdjęcie"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white md:right-6"
              >
                <ChevronRight size={32} strokeWidth={1.5} />
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs tracking-widest text-white/60">
              {active + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
