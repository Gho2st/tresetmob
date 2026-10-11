"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import type { LoginImage } from "@/lib/hero";
import { updateLoginImage } from "@/app/admin/(protected)/logowanie/actions";

export default function LoginImageForm({ image }: { image: LoginImage }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [alt, setAlt] = useState(image.alt ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File | null) => {
    setFile(f);
    setSaved(false);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : null;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    setError(null);
    setSaved(false);
    setSaving(true);

    try {
      let src = image.src;
      if (file) {
        // Upload leci z przeglądarki prosto do Blob — ta sama trasa co dla hero,
        // bo zdjęcie na pół ekranu bywa większe niż limit body Server Action.
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/hero-upload",
        });
        src = blob.url;
      }

      const formData = new FormData(formRef.current);
      formData.set("src", src);
      await updateLoginImage(formData);
      handleFile(null);
      setSaved(true);
    } catch {
      setError("Nie udało się zapisać. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  };

  const currentSrc = previewUrl ?? image.src;

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
        <div className="relative aspect-3/4 w-full max-w-xs overflow-hidden bg-neutral-100">
          <Image
            src={currentSrc}
            alt=""
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>
        <p className="text-xs text-black/40">
          Na stronie logowania zdjęcie wypełnia lewą połowę ekranu i jest
          przycinane do jej kształtu. Na telefonie nie pokazuje się wcale.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-widest text-black/40 uppercase">
          Nowe zdjęcie
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <p className="text-xs text-black/40">
          Zostaw puste, żeby zachować obecne zdjęcie.
        </p>
      </div>

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
        <p className="text-xs text-black/40">
          Zostaw puste, jeśli zdjęcie jest wyłącznie dekoracyjne — czytnik
          ekranu je wtedy pominie, zamiast czytać opis bez znaczenia.
        </p>
      </div>

      {error && <p className="text-xs text-red-700">{error}</p>}
      {saved && !error && (
        <p className="text-xs text-black/50">Zapisano.</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 w-full bg-black px-7 py-3.5 text-sm tracking-widest text-white uppercase transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:w-fit"
      >
        {saving ? "Zapisywanie..." : "Zapisz zdjęcie"}
      </button>
    </form>
  );
}
