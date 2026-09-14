"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { parseRows } from "@/lib/size-charts";

function readSizeChartFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const illustration = String(formData.get("illustration") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;

  let table: { sizes?: unknown; rows?: unknown };
  try {
    table = JSON.parse(String(formData.get("table") ?? "{}"));
  } catch {
    throw new Error("Nieprawidłowe dane tabeli.");
  }

  const rawSizes = Array.isArray(table.sizes)
    ? table.sizes.map((size) => String(size).trim())
    : [];
  // Puste nagłówki odrzucamy razem z ich kolumną wartości, żeby wiersze się nie rozjechały.
  const kept = rawSizes.flatMap((size, i) => (size ? [i] : []));
  const sizes = kept.map((i) => rawSizes[i]);
  const rows = parseRows(table.rows, rawSizes.length)
    .map((row) => ({
      label: row.label.trim(),
      description: row.description.trim(),
      values: kept.map((i) => row.values[i].trim()),
    }))
    .filter((row) => row.label);

  if (!name) throw new Error("Podaj nazwę tabeli.");
  if (sizes.length === 0) throw new Error("Dodaj co najmniej jeden rozmiar.");
  if (rows.length === 0) throw new Error("Dodaj co najmniej jeden wymiar.");

  return { name, illustration, note, sizes, rows };
}

function revalidateSizeCharts() {
  // Tabele wyświetlają się na stronach produktów — odświeżamy cały sklep.
  revalidatePath("/", "layout");
  revalidatePath("/admin/tabele-rozmiarow");
}

export async function createSizeChart(formData: FormData) {
  await requireAdmin();
  const data = readSizeChartFields(formData);

  await prisma.sizeChart.create({ data });
  revalidateSizeCharts();
  redirect("/admin/tabele-rozmiarow");
}

export async function updateSizeChart(id: string, formData: FormData) {
  await requireAdmin();
  const data = readSizeChartFields(formData);

  await prisma.sizeChart.update({ where: { id }, data });
  revalidateSizeCharts();
  redirect("/admin/tabele-rozmiarow");
}

export async function deleteSizeChart(id: string) {
  await requireAdmin();
  // Przypisane produkty zostają, tylko tracą tabelę — relacja ma onDelete: SetNull.
  await prisma.sizeChart.delete({ where: { id } });
  revalidateSizeCharts();
}
