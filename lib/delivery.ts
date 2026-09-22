// Wybór paczkomatu opiera się na mapie InPost (Geowidget v5). Cały widget działa
// po stronie InPostu — my trzymamy tylko publiczny token i adresy plików.
//
// Token generuje się w Managerze Paczek (manager.paczkomaty.pl → Moje konto →
// API → Geowidget) i jest przypisany do domeny sklepu. Dla sandboxa token
// generuje się w sandbox-manager.paczkomaty.pl, a dla localhost bez domeny.

export type InPostPoint = {
  name: string;
  address: string;
};

const SANDBOX = process.env.NEXT_PUBLIC_INPOST_GEOWIDGET_SANDBOX === "true";

const SDK_URL = SANDBOX
  ? "https://sandbox-easy-geowidget-sdk.easypack24.net"
  : "https://geowidget.inpost.pl";

export const GEOWIDGET = {
  token: process.env.NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN ?? "",
  // parcelCollect = punkty odbioru przesyłek opłaconych z góry, czyli tak, jak
  // działa nasza kasa (płatność online, bez pobrania).
  config: "parcelCollect",
  language: "pl",
  js: `${SDK_URL}/inpost-geowidget.js`,
  css: `${SDK_URL}/inpost-geowidget.css`,
};

// Widget oddaje surowy punkt z API InPostu. Bierzemy z niego tylko to, co
// pokazujemy klientowi i zapisujemy w zamówieniu — reszta pól nas nie obchodzi.
type RawPoint = {
  name?: string;
  address?: { line1?: string; line2?: string };
  address_details?: {
    street?: string;
    building_number?: string;
    post_code?: string;
    city?: string;
  };
};

export function toInPostPoint(raw: unknown): InPostPoint | null {
  const point = raw as RawPoint | null;
  if (!point?.name) return null;

  const details = point.address_details;
  const line1 =
    point.address?.line1 ??
    [details?.street, details?.building_number].filter(Boolean).join(" ");
  const line2 =
    point.address?.line2 ??
    [details?.post_code, details?.city].filter(Boolean).join(" ");

  return {
    name: point.name,
    address: [line1, line2].filter(Boolean).join(", "),
  };
}

export function formatInPostPoint(point: InPostPoint) {
  return point.address ? `${point.name} — ${point.address}` : point.name;
}
