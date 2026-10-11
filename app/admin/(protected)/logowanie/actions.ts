"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { LOGIN_IMAGE_KEY } from "@/lib/hero";

export async function updateLoginImage(formData: FormData) {
  await requireAdmin();

  const src = String(formData.get("src") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();

  if (!src) {
    throw new Error("Brak pliku.");
  }

  await prisma.hero.upsert({
    where: { id: LOGIN_IMAGE_KEY },
    update: { type: "image", src, alt: alt || null, poster: null },
    create: { id: LOGIN_IMAGE_KEY, type: "image", src, alt: alt || null },
  });

  revalidatePath("/logowanie");
  revalidatePath("/admin/logowanie");
}
