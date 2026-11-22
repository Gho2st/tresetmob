import { Wrench } from "lucide-react";
import { getShopSettings } from "@/lib/shop-settings";

// Pod nawigacją, nie nad nią: Nav jest sticky, a mobilne menu otwiera się
// od stałego top-14 — pasek nad Nav przesuwałby go względem menu.
export default async function MaintenanceBanner() {
  const { maintenance, maintenanceMessage } = await getShopSettings();
  if (!maintenance) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 bg-black px-4 py-3 text-center text-xs tracking-wide text-white sm:text-sm"
    >
      <Wrench aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      <span>{maintenanceMessage}</span>
    </div>
  );
}
