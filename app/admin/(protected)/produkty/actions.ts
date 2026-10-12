"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { effectivePriceCents } from "@/lib/price-history";

function parseCents(raw: FormDataEntryValue | null): number | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;
  const value = Math.round(Number.parseFloat(trimmed.replace(",", ".")) * 100);
  return Number.isFinite(value) ? value : null;
}

// Pole <input type="date"> daje "RRRR-MM-DD"; zapisujemy północ UTC, żeby ta
// sama data wracała do formularza niezależnie od strefy czasowej serwera.
function parseDate(raw: FormDataEntryValue | null): Date | null {
  const trimmed = String(raw ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const date = new Date(`${trimmed}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function readProductFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceCents = parseCents(formData.get("price"));
  const salePriceCents = parseCents(formData.get("salePrice"));
  const releasedAt = parseDate(formData.get("releasedAt"));
  // Adresy i opisy przychodzą jako dwie równoległe listy — parujemy je przed
  // odsianiem pustych wpisów, żeby opis nie przesunął się na inne zdjęcie.
  const altValues = formData.getAll("imageAlts").map(String);
  const imageEntries = formData
    .getAll("images")
    .map((value, index) => ({
      url: String(value).trim(),
      alt: (altValues[index] ?? "").trim(),
    }))
    .filter((entry) => entry.url.length > 0);
  const images = imageEntries.map((entry) => entry.url);
  const imageAlts = imageEntries.map((entry) => entry.alt);
  const sizeChartId = String(formData.get("sizeChartId") ?? "").trim() || null;

  const variantSizes = formData.getAll("variantSize").map(String);
  const variantStocks = formData.getAll("variantStock").map(String);
  const variants = variantSizes
    .map((size, i) => ({
      size: size.trim(),
      stock: Number.parseInt(variantStocks[i] ?? "0", 10),
    }))
    .filter((v) => v.size.length > 0);

  if (!title || !slug || !description) {
    throw new Error("Tytuł, slug i opis są wymagane.");
  }
  if (!priceCents || priceCents <= 0) {
    throw new Error("Podaj poprawną cenę.");
  }
  if (salePriceCents !== null && (salePriceCents <= 0 || salePriceCents >= priceCents)) {
    throw new Error("Cena promocyjna musi być dodatnia i niższa od zwykłej ceny.");
  }
  if (!releasedAt) {
    throw new Error("Podaj datę premiery.");
  }
  if (images.length === 0) {
    throw new Error("Dodaj co najmniej jedno zdjęcie.");
  }
  if (variants.length === 0) {
    throw new Error("Dodaj co najmniej jeden rozmiar.");
  }
  if (variants.some((v) => !Number.isFinite(v.stock) || v.stock < 0)) {
    throw new Error("Stan magazynowy musi być liczbą nieujemną.");
  }

  return {
    title,
    slug,
    description,
    priceCents,
    salePriceCents,
    releasedAt,
    images,
    imageAlts,
    sizeChartId,
    variants,
  };
}

function revalidateCatalog(slug?: string) {
  // "/" jako sam literal path czasem nie odświeża cache'u ISR na Vercelu przy
  // wizytach spoza sesji, która wywołała akcję — "layout" wymusza pełną inwalidację.
  revalidatePath("/", "layout");
  revalidatePath("/sklep");
  revalidatePath("/admin/produkty");
  if (slug) revalidatePath(`/produkty/${slug}`);
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const { variants, ...data } = readProductFields(formData);

  await prisma.product.create({
    data: {
      ...data,
      variants: { create: variants },
      priceHistory: { create: { priceCents: effectivePriceCents(data) } },
    },
  });
  revalidateCatalog(data.slug);
  redirect("/admin/produkty");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const { variants, ...data } = readProductFields(formData);

  // Do historii trafia tylko faktyczna zmiana ceny — zapis samego opisu czy
  // stanów nie może wyglądać jak nowa obniżka.
  const current = await prisma.product.findUnique({
    where: { id },
    select: { priceCents: true, salePriceCents: true },
  });
  const newPrice = effectivePriceCents(data);
  const priceChanged = !current || effectivePriceCents(current) !== newPrice;

  // Warianty zastępowane w całości (usuń + utwórz od nowa) — prościej niż
  // diffowanie zmian rozmiar-po-rozmiarze, bezpieczne dzięki $transaction.
  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        ...data,
        variants: { create: variants },
        ...(priceChanged && {
          priceHistory: { create: { priceCents: newPrice } },
        }),
      },
    }),
  ]);
  revalidateCatalog(data.slug);
  redirect("/admin/produkty");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const product = await prisma.product.delete({ where: { id } });
  revalidateCatalog(product.slug);
}

export async function moveProduct(id: string, direction: "up" | "down") {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true },
  });
  const index = products.findIndex((p) => p.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= products.length) return;

  [products[index], products[swapWith]] = [products[swapWith], products[index]];

  // Renumeracja całej listy wg nowej kolejności — prościej i odporniejsze na
  // niejednoznaczności (np. remisy sortOrder) niż zamiana tylko dwóch wartości.
  await prisma.$transaction(
    products.map((p, i) =>
      prisma.product.update({ where: { id: p.id }, data: { sortOrder: i } }),
    ),
  );
  revalidateCatalog();
}
