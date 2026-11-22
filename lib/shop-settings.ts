import "server-only";
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export const DEFAULT_MAINTENANCE_MESSAGE =
  "Sklep jest w trakcie prac technicznych — składanie zamówień jest chwilowo wyłączone. Zapraszamy wkrótce!";

export type ShopSettings = {
  maintenance: boolean;
  maintenanceMessage: string;
};

/**
 * Brak wiersza, a przed migracją nawet brak tabeli, to po prostu sklep bez
 * prac technicznych — strona ma się wtedy wyrenderować normalnie, nie wywalić.
 */
export async function getShopSettings(): Promise<ShopSettings> {
  try {
    const row = await prisma.shopSettings.findUnique({ where: { id: SETTINGS_ID } });
    return {
      maintenance: row?.maintenance ?? false,
      maintenanceMessage: row?.maintenanceMessage?.trim() || DEFAULT_MAINTENANCE_MESSAGE,
    };
  } catch {
    return { maintenance: false, maintenanceMessage: DEFAULT_MAINTENANCE_MESSAGE };
  }
}

export async function saveShopSettings(settings: {
  maintenance: boolean;
  maintenanceMessage: string | null;
}) {
  await prisma.shopSettings.upsert({
    where: { id: SETTINGS_ID },
    update: settings,
    create: { id: SETTINGS_ID, ...settings },
  });
}
