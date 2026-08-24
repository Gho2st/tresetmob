"use server";

import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin";

export async function uploadProductImage(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Brak pliku.");
  }

  const blob = await put(file.name, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return { url: blob.url };
}
