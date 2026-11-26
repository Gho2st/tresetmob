import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

// Integracja z bramką HotPay (https://dokumentacja.hotpay.pl/), wariant
// "API zaawansowane z walidacją parametrów" — inicjalizacja zwraca JSON
// z linkiem do panelu płatności zamiast wymagać przekierowania przez <form>.
const HOTPAY_ENDPOINT = "https://platnosc.hotpay.pl/";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Brak zmiennej środowiskowej ${name}.`);
  return value;
}

export function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

type InitHotpayPaymentInput = {
  orderNumber: string;
  amountCents: number;
  description: string;
  email: string;
  returnUrl: string;
};

type InitHotpayPaymentResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function initHotpayPayment(
  input: InitHotpayPaymentInput,
): Promise<InitHotpayPaymentResult> {
  const sekret = requireEnv("HOTPAY_SEKRET");
  // "Hasło notyfikacji" z ustawień usługi w panelu HotPay — podpisuje zarówno
  // inicjalizację płatności, jak i notyfikacje.
  const haslo = requireEnv("HOTPAY_NOTIFY");

  const kwota = (input.amountCents / 100).toFixed(2);

  const body = new FormData();
  body.set("TYP", "INIT");
  body.set("SEKRET", sekret);
  body.set("KWOTA", kwota);
  body.set("NAZWA_USLUGI", input.description);
  body.set("ADRES_WWW", input.returnUrl);
  body.set("ID_ZAMOWIENIA", input.orderNumber);
  body.set("EMAIL", input.email);
  body.set(
    "HASH",
    sha256(
      [haslo, kwota, input.description, input.returnUrl, input.orderNumber, sekret].join(";"),
    ),
  );

  let response: Response;
  try {
    response = await fetch(HOTPAY_ENDPOINT, { method: "POST", body });
  } catch {
    return { ok: false, error: "Nie udało się połączyć z bramką płatności." };
  }

  if (!response.ok) {
    return { ok: false, error: "Bramka płatności zwróciła błąd." };
  }

  const json = (await response.json()) as {
    STATUS: boolean;
    URL?: string;
    WIADOMOSC?: string;
  };

  if (!json.STATUS || !json.URL) {
    return { ok: false, error: json.WIADOMOSC ?? "Płatność została odrzucona." };
  }

  return { ok: true, url: json.URL };
}

export type HotpayNotification = {
  SEKRET?: string;
  KWOTA?: string;
  STATUS?: string;
  ID_ZAMOWIENIA?: string;
  ID_PLATNOSCI?: string;
  SECURE?: string;
  HASH?: string;
};

/** "1", "1.0", "1.00" → 100. Bez floatów, jak zaleca dokumentacja HotPay. */
export function parseHotpayAmount(raw: string | undefined): number | null {
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec((raw ?? "").trim());
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

export function verifyHotpayNotification(fields: HotpayNotification): boolean {
  const haslo = requireEnv("HOTPAY_NOTIFY");
  const sekret = requireEnv("HOTPAY_SEKRET");

  if (fields.SEKRET !== sekret) return false;
  // Wariant z walidacją zawsze wysyła SECURE i podpisuje je razem z resztą pól.
  if (!fields.HASH || !fields.SECURE) return false;

  const expected = sha256(
    [
      haslo,
      fields.KWOTA ?? "",
      fields.ID_PLATNOSCI ?? "",
      fields.ID_ZAMOWIENIA ?? "",
      fields.STATUS ?? "",
      fields.SECURE,
      sekret,
    ].join(";"),
  );

  // Porównanie w stałym czasie — sygnatura płatności to sekret, więc zwykłe
  // "===" (przerywane na pierwszym niezgodnym znaku) mogłoby dać atak czasowy.
  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(fields.HASH, "hex");
  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * TYMCZASOWA diagnostyka odrzuconych notyfikacji — mówi, czy zgadza się sekret
 * i który wariant skrótu pasuje, bez ujawniania wartości pól ani hasła.
 * Do usunięcia, gdy notyfikacje zaczną przechodzić.
 */
export function diagnoseHotpayNotification(fields: Record<string, string>) {
  const haslo = requireEnv("HOTPAY_NOTIFY");
  const sekret = requireEnv("HOTPAY_SEKRET");
  const f = (name: string) => fields[name] ?? "";
  const received = f("HASH").toLowerCase();

  const candidates: Record<string, string[]> = {
    dokumentacja: [haslo, f("KWOTA"), f("ID_PLATNOSCI"), f("ID_ZAMOWIENIA"), f("STATUS"), f("SECURE"), sekret],
    bezSecure: [haslo, f("KWOTA"), f("ID_PLATNOSCI"), f("ID_ZAMOWIENIA"), f("STATUS"), sekret],
    sekretZPola: [haslo, f("KWOTA"), f("ID_PLATNOSCI"), f("ID_ZAMOWIENIA"), f("STATUS"), f("SECURE"), f("SEKRET")],
    przycieteEnv: [haslo.trim(), f("KWOTA"), f("ID_PLATNOSCI"), f("ID_ZAMOWIENIA"), f("STATUS"), f("SECURE"), sekret.trim()],
    zamienioneId: [haslo, f("KWOTA"), f("ID_ZAMOWIENIA"), f("ID_PLATNOSCI"), f("STATUS"), f("SECURE"), sekret],
  };

  return {
    fieldNames: Object.keys(fields).sort(),
    sekretMatches: f("SEKRET") === sekret,
    sekretMatchesTrimmed: f("SEKRET").trim() === sekret.trim(),
    envHasWhitespace: haslo !== haslo.trim() || sekret !== sekret.trim(),
    hashLength: received.length,
    matchingFormula:
      Object.entries(candidates).find(([, parts]) => sha256(parts.join(";")) === received)?.[0] ??
      null,
  };
}
