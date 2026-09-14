"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { uploadProductImage } from "./actions";

type ProductFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
  sizeCharts: { id: string; name: string }[];
};

type ImageEntry =
  | { kind: "existing"; id: string; url: string }
  | { kind: "pending"; id: string; file: File; previewUrl: string };

type VariantRow = {
  id: string;
  size: string;
  stock: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductForm({
  action,
  product,
  sizeCharts,
}: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map((v) => ({
      id: v.id,
      size: v.size,
      stock: String(v.stock),
    })) ?? [],
  );
  const [newSize, setNewSize] = useState("");
  const [images, setImages] = useState<ImageEntry[]>(
    product?.images.map((url) => ({
      kind: "existing" as const,
      id: url,
      url,
    })) ?? [],
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const addVariant = () => {
    const size = newSize.trim();
    if (!size || variants.some((v) => v.size === size)) return;
    setVariants((prev) => [...prev, { id: crypto.randomUUID(), size, stock: "0" }]);
    setNewSize("");
  };

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVariantStock = (id: string, stock: string) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, stock } : v)));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: ImageEntry[] = Array.from(files).map((file) => ({
      kind: "pending",
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...next]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.kind === "pending") URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const moveImage = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setImages((prev) => {
      const fromIndex = prev.findIndex((i) => i.id === fromId);
      const toIndex = prev.findIndex((i) => i.id === toId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    setError(null);
    setSaving(true);

    let orderedUrls: string[];
    try {
      orderedUrls = await Promise.all(
        images.map(async (entry) => {
          if (entry.kind === "existing") return entry.url;
          const body = new FormData();
          body.set("file", entry.file);
          const { url } = await uploadProductImage(body);
          return url;
        }),
      );
    } catch {
      setError("Nie udało się wgrać zdjęć. Spróbuj zapisać ponownie.");
      setSaving(false);
      return;
    }

    const formData = new FormData(formRef.current);
    formData.delete("images");
    for (const url of orderedUrls) {
      formData.append("images", url);
    }

    // Od tego miejsca nie łapiemy błędów — createProduct/updateProduct kończą
    // się redirectem, który celowo musi przelecieć dalej, nie zostać złapany.
    await action(formData);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-widest text-black/40 uppercase">
          Tytuł
        </label>
        <input
          name="title"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-widest text-black/40 uppercase">
          Slug (adres URL)
        </label>
        <input
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className="border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs tracking-widest text-black/40 uppercase">
            Cena (zł)
          </label>
          <input
            name="price"
            required
            type="text"
            inputMode="decimal"
            defaultValue={product ? (product.priceCents / 100).toFixed(2) : ""}
            placeholder="359.00"
            className="border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs tracking-widest text-black/40 uppercase">
            Cena promocyjna (zł)
          </label>
          <input
            name="salePrice"
            type="text"
            inputMode="decimal"
            defaultValue={
              product?.salePriceCents != null
                ? (product.salePriceCents / 100).toFixed(2)
                : ""
            }
            placeholder="puste = brak promocji"
            className="border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-widest text-black/40 uppercase">
          Opis
        </label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={product?.description}
          className="border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs tracking-widest text-black/40 uppercase">
          Rozmiary i stan magazynowy
        </label>
        <div className="flex flex-col gap-2">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center gap-2">
              <span className="flex w-16 items-center border border-black/20 px-3 py-2 text-sm">
                {v.size}
              </span>
              <input type="hidden" name="variantSize" value={v.size} />
              <input
                type="number"
                min={0}
                name="variantStock"
                value={v.stock}
                onChange={(e) => updateVariantStock(v.id, e.target.value)}
                className="w-24 border border-black/20 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <span className="text-xs text-black/40">szt.</span>
              <button
                type="button"
                onClick={() => removeVariant(v.id)}
                aria-label={`Usuń rozmiar ${v.size}`}
                className="ml-auto text-black/40 hover:text-black"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addVariant();
              }
            }}
            placeholder="np. M"
            className="border border-black/20 px-4 py-2 text-sm focus:border-black focus:outline-none"
          />
          <button
            type="button"
            onClick={addVariant}
            className="border border-black/30 px-4 text-xs tracking-widest uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
          >
            Dodaj rozmiar
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-widest text-black/40 uppercase">
          Tabela rozmiarów
        </label>
        <select
          name="sizeChartId"
          defaultValue={product?.sizeChartId ?? ""}
          className="border border-black/20 bg-white px-4 py-3 text-sm focus:border-black focus:outline-none"
        >
          <option value="">Brak tabeli</option>
          {sizeCharts.map((chart) => (
            <option key={chart.id} value={chart.id}>
              {chart.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-black/40">
          Tabele tworzysz w zakładce „Tabele rozmiarów”.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs tracking-widest text-black/40 uppercase">
          Zdjęcia
        </label>
        <p className="text-xs text-black/40">
          Przeciągnij, żeby zmienić kolejność — pierwsze zdjęcie jest głównym.
        </p>
        <div className="flex flex-wrap gap-3">
          {images.map((entry) => (
            <div
              key={entry.id}
              draggable
              onDragStart={() => setDragId(entry.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) moveImage(dragId, entry.id);
                setDragId(null);
              }}
              className="relative h-24 w-24 cursor-grab overflow-hidden border border-black/10 active:cursor-grabbing"
            >
              {entry.kind === "existing" ? (
                <Image
                  src={entry.url}
                  alt=""
                  fill
                  sizes="96px"
                  className="pointer-events-none object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- lokalny podgląd z blob: URL, nie z Vercel Image Optimization
                <img
                  src={entry.previewUrl}
                  alt=""
                  className="pointer-events-none h-full w-full object-cover"
                />
              )}
              {entry.kind === "pending" && (
                <span className="absolute right-1 bottom-1 bg-black/70 px-1.5 py-0.5 text-[10px] text-white uppercase">
                  Nowe
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(entry.id)}
                aria-label="Usuń zdjęcie"
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center bg-black text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="text-sm"
        />
        <p className="text-xs text-black/40">
          Zdjęcia wgrają się dopiero po kliknięciu „Zapisz produkt”.
        </p>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-2 w-fit bg-black px-7 py-3.5 text-sm tracking-widest text-white uppercase transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {saving ? "Zapisywanie..." : "Zapisz produkt"}
      </button>
    </form>
  );
}
