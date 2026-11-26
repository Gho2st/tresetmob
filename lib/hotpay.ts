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

// "Hasło notyfikacji" z ustawień usługi w panelu HotPay (HOTPAY_NOTIFY) podpisuje
// zapytania i notyfikacje. Bez niego płatność idzie wariantem "API bez walidacji"
// (formularz z przeglądarki), a notyfikację weryfikuje tylko SEKRET plus zgodność
// kwoty z zamówieniem — awaryjny tryb na czas, gdy hasła nie ma.
function optionalHaslo() {
  return process.env.HOTPAY_NOTIFY?.trim() || null;
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

// Wariant z hasłem oddaje gotowy link, wariant bez walidacji — pola formularza,
// które przeglądarka klienta musi sama wysłać POST-em do bramki.
export type HotpayRedirect =
  | { url: string }
  | { form: { action: string; fields: Record<string, string> } };

type InitHotpayPaymentResult =
  | { ok: true; redirect: HotpayRedirect }
  | { ok: false; error: string };

export async function initHotpayPayment(
  input: InitHotpayPaymentInput,
): Promise<InitHotpayPaymentResult> {
  const sekret = requireEnv("HOTPAY_SEKRET");
  const haslo = optionalHaslo();

  const kwota = (input.amountCents / 100).toFixed(2);

  if (!haslo) {
    return {
      ok: true,
      redirect: {
        form: {
          action: HOTPAY_ENDPOINT,
          fields: {
            SEKRET: sekret,
            KWOTA: kwota,
            NAZWA_USLUGI: input.description,
            ADRES_WWW: input.returnUrl,
            ID_ZAMOWIENIA: input.orderNumber,
            EMAIL: input.email,
          },
        },
      },
    };
  }

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

  return { ok: true, redirect: { url: json.URL } };
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

export function verifyHotpayNotification(fields: HotpayNotification): boolean {
  const haslo = optionalHaslo();
  const sekret = requireEnv("HOTPAY_SEKRET");

  if (fields.SEKRET !== sekret) return false;
  if (!haslo) return true;
  if (!fields.HASH) return false;

  const expected = sha256(
    [
      haslo,
      fields.KWOTA ?? "",
      fields.ID_PLATNOSCI ?? "",
      fields.ID_ZAMOWIENIA ?? "",
      fields.STATUS ?? "",
      fields.SECURE ?? "",
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
