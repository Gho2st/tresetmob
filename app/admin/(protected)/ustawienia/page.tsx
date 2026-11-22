import { prisma } from "@/lib/prisma";
import { DEFAULT_MAINTENANCE_MESSAGE } from "@/lib/shop-settings";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SettingsForm from "./SettingsForm";

export default async function AdminUstawienia() {
  // Surowy wiersz, nie getShopSettings — formularz ma pokazać puste pole, gdy
  // admin nie wpisał własnego komunikatu, a nie domyślny tekst jako wartość.
  const row = await prisma.shopSettings.findUnique({ where: { id: "singleton" } });

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Ustawienia" />
      <SettingsForm
        maintenance={row?.maintenance ?? false}
        maintenanceMessage={row?.maintenanceMessage ?? null}
        defaultMessage={DEFAULT_MAINTENANCE_MESSAGE}
      />
    </div>
  );
}
