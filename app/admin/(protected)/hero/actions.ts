"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function updateHero(formData: FormData) {
  await requireAdmin();

  const type = String(formData.get("type") ?? "");
  const src = String(formData.get("src") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();

  if (type !== "image" && type !== "video") {
    throw new Error("Nieznany typ.");
  }
  if (!src) {
    throw new Error("Brak pliku.");
  }

  await prisma.hero.upsert({
    where: { id: "singleton" },
    update: { type, src, alt: alt || null, poster: null },
    create: { id: "singleton", type, src, alt: alt || null },
  });

  // "/" jako sam literal path czasem nie odświeża cache'u ISR na Vercelu przy
  // wizytach spoza sesji, która wywołała akcję — "layout" wymusza pełną inwalidację.
  revalidatePath("/", "layout");
  revalidatePath("/admin/hero");
}
