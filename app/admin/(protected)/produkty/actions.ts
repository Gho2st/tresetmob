"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function parseCents(raw: FormDataEntryValue | null): number | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;
  const value = Math.round(Number.parseFloat(trimmed.replace(",", ".")) * 100);
  return Number.isFinite(value) ? value : null;
}

function readProductFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceCents = parseCents(formData.get("price"));
  const salePriceCents = parseCents(formData.get("salePrice"));
  const images = formData.getAll("images").map(String).filter(Boolean);

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
  if (images.length === 0) {
    throw new Error("Dodaj co najmniej jedno zdjęcie.");
  }
  if (variants.length === 0) {
    throw new Error("Dodaj co najmniej jeden rozmiar.");
  }
  if (variants.some((v) => !Number.isFinite(v.stock) || v.stock < 0)) {
    throw new Error("Stan magazynowy musi być liczbą nieujemną.");
  }

  return { title, slug, description, priceCents, salePriceCents, images, variants };
}

function revalidateCatalog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/kolekcje");
  revalidatePath("/admin/produkty");
  if (slug) revalidatePath(`/produkty/${slug}`);
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const { variants, ...data } = readProductFields(formData);

  await prisma.product.create({
    data: { ...data, variants: { create: variants } },
  });
  revalidateCatalog(data.slug);
  redirect("/admin/produkty");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const { variants, ...data } = readProductFields(formData);

  // Warianty zastępowane w całości (usuń + utwórz od nowa) — prościej niż
  // diffowanie zmian rozmiar-po-rozmiarze, bezpieczne dzięki $transaction.
  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: { ...data, variants: { create: variants } },
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
