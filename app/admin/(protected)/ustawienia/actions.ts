"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { saveShopSettings } from "@/lib/shop-settings";

export async function updateShopSettings(formData: FormData) {
  await requireAdmin();

  await saveShopSettings({
    maintenance: formData.get("maintenance") === "on",
    maintenanceMessage: String(formData.get("maintenanceMessage") ?? "").trim() || null,
  });

  // Pasek siedzi w layoucie sklepu, więc odświeżamy wszystkie strony naraz.
  revalidatePath("/", "layout");
}
