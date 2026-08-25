"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import type { HeroMedia } from "@/lib/hero";
import { updateHero } from "@/app/admin/(protected)/hero/actions";

export default function HeroForm({ hero }: { hero: HeroMedia }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<"image" | "video">(hero.type);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [alt, setAlt] = useState(hero.type === "image" ? (hero.alt ?? "") : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File | null) => {
    setFile(f);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : null;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    setError(null);

    if (!file && type !== hero.type) {
      setError("Dodaj plik pasujący do wybranego typu.");
      return;
    }

    setSaving(true);
    try {
      let src = hero.src;
      if (file) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/hero-upload",
        });
        src = blob.url;
      }

      const formData = new FormData(formRef.current);
      formData.set("src", src);
      await updateHero(formData);
      handleFile(null);
    } catch {
      setError("Nie udało się zapisać. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  };

  // Nie pokazuj starego src, jeśli admin przełączył typ, a jeszcze nie wybrał
  // pasującego pliku — inaczej <Image>/<video> próbowałyby wczytać plik złego typu.
  const currentSrc = previewUrl ?? (type === hero.type ? hero.src : null);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex max-w-xl flex-col gap-8"
    >
      <div className="flex flex-col gap-3">
        <label className="text-xs tracking-widest text-black/40 uppercase">
          Podgląd
        </label>
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
          {type === "video" && currentSrc ? (
            <video
              key={currentSrc}
              src={currentSrc}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : type === "image" && currentSrc ? (
            <Image src={currentSrc} alt="" fill className="object-cover" />
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-widest text-black/40 uppercase">
          Typ
        </label>
        <div className="flex gap-2">
          {(["image", "video"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                handleFile(null);
              }}
              className={`border px-4 py-2 text-sm tracking-wide uppercase transition-colors ${
                type === t
                  ? "border-black bg-black text-white"
                  : "border-black/20 hover:border-black"
              }`}
            >
              {t === "image" ? "Zdjęcie" : "Wideo"}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={type} readOnly />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-widest text-black/40 uppercase">
          {type === "image" ? "Nowe zdjęcie" : "Nowe wideo"}
        </label>
        <input
          type="file"
          accept={
            type === "image"
              ? "image/png,image/jpeg,image/webp"
              : "video/mp4,video/quicktime,video/webm"
          }
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <p className="text-xs text-black/40">
          Zostaw puste, żeby zachować obecny plik.
        </p>
      </div>

      {type === "image" && (
        <div className="flex flex-col gap-2">
          <label className="text-xs tracking-widest text-black/40 uppercase">
            Tekst alternatywny
          </label>
          <input
            name="alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 w-fit bg-black px-7 py-3.5 text-sm tracking-widest text-white uppercase transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {saving ? "Zapisywanie..." : "Zapisz hero"}
      </button>
    </form>
  );
}
