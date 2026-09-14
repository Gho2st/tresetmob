"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  title: string;
};

const slideIndex = (el: HTMLDivElement) =>
  el.clientWidth ? Math.round(el.scrollLeft / el.clientWidth) : 0;

export default function Gallery({ images, title }: Props) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const lightboxTrackRef = useRef<HTMLDivElement>(null);

  const open = (index: number) => {
    setActive(index);
    setLightboxOpen(true);
  };

  // Podgląd to poziomo przewijany tor ze snapem — dzięki temu na telefonie
  // działa natywny swipe. Strzałki i klawiatura po prostu go przewijają.
  const scrollLightboxTo = (index: number, behavior: ScrollBehavior = "smooth") => {
    const el = lightboxTrackRef.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior });
  };

  const showPrev = () => {
    const el = lightboxTrackRef.current;
    if (!el) return;
    const i = slideIndex(el);
    // z pierwszego zdjęcia skok od razu na ostatnie, bez przewijania przez całą galerię
    if (i === 0) scrollLightboxTo(images.length - 1, "instant");
    else scrollLightboxTo(i - 1);
  };

  const showNext = () => {
    const el = lightboxTrackRef.current;
    if (!el) return;
    const i = slideIndex(el);
    if (i === images.length - 1) scrollLightboxTo(0, "instant");
    else scrollLightboxTo(i + 1);
  };

  const close = () => {
    const el = lightboxTrackRef.current;
    const index = el ? slideIndex(el) : active;
    setActive(index);
    setLightboxOpen(false);
    // slider na stronie wraca do zdjęcia, które było oglądane w podglądzie
    const track = trackRef.current;
    if (track) track.scrollTo({ left: index * track.clientWidth, behavior: "instant" });
  };

  // ustaw podgląd na klikniętym zdjęciu, zanim przeglądarka go narysuje
  useLayoutEffect(() => {
    if (lightboxOpen) scrollLightboxTo(active, "instant");
    // tylko przy otwarciu — potem pozycją steruje przewijanie toru
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    // blokada scrolla tła pod podglądem
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // close/showPrev/showNext czytają pozycję z refów, więc listener
    // wystarczy (od)montować przy otwarciu/zamknięciu podglądu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (el) setActive(slideIndex(el));
  };

  const onLightboxScroll = () => {
    const el = lightboxTrackRef.current;
    if (el) setActive(slideIndex(el));
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
              className="relative aspect-square w-full flex-none snap-start bg-neutral-100"
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
            className="relative aspect-square w-full cursor-zoom-in bg-neutral-100"
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
          role="dialog"
          aria-modal="true"
          aria-label={`Podgląd zdjęć: ${title}`}
          className="fixed inset-0 z-100 bg-black/95"
        >
          <div
            ref={lightboxTrackRef}
            onScroll={onLightboxScroll}
            className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((src, i) => (
              <div
                key={src}
                onClick={close}
                className="flex h-full w-full flex-none snap-center items-center justify-center px-4 md:px-20"
              >
                <div
                  className="relative h-[80vh] w-full max-w-4xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={src}
                    alt={`${title} — zdjęcie ${i + 1} z ${images.length}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Zamknij"
            onClick={close}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={28} strokeWidth={1.5} />
          </button>

          {images.length > 1 && (
            <>
              {/* strzałki tylko od md — na telefonie przesuwa się palcem */}
              <button
                type="button"
                aria-label="Poprzednie zdjęcie"
                onClick={showPrev}
                className="absolute top-1/2 left-6 hidden -translate-y-1/2 text-white/80 hover:text-white md:block"
              >
                <ChevronLeft size={32} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label="Następne zdjęcie"
                onClick={showNext}
                className="absolute top-1/2 right-6 hidden -translate-y-1/2 text-white/80 hover:text-white md:block"
              >
                <ChevronRight size={32} strokeWidth={1.5} />
              </button>

              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs tracking-widest text-white/60">
                {active + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
