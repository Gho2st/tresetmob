"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CreditCard, Landmark, Lock, Smartphone } from "lucide-react";
import { PENDING_ORDER_STORAGE_KEY, useCart } from "@/components/CartProvider";
import {
  formatInPostPoint,
  type InPostPoint,
} from "@/lib/delivery";
import InPostGeowidget from "@/components/checkout/InPostGeowidget";
import OrderSummary from "@/components/OrderSummary";
import { isValidNip } from "@/lib/nip";
import { createOrder } from "./actions";

const DELIVERY_METHODS = [
  { id: "kurier", label: "Kurier InPost" },
  { id: "paczkomat", label: "Paczkomat InPost" },
] as const;

const PAYMENT_METHODS = [
  { label: "BLIK", Icon: Smartphone },
  { label: "Przelew", Icon: Landmark },
  { label: "Karta", Icon: CreditCard },
] as const;

const INPUT =
  "w-full border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none";

// Pamięć przeglądarki bywa niedostępna (tryb prywatny) — wtedy po prostu nie
// porzucamy poprzedniej próby od razu; zrobi to i tak limit godziny.
function readPendingOrder() {
  try {
    return window.localStorage.getItem(PENDING_ORDER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writePendingOrder(number: string) {
  try {
    window.localStorage.setItem(PENDING_ORDER_STORAGE_KEY, number);
  } catch {
    // ignore unavailable storage
  }
}

export default function Checkout() {
  const { items, subtotal, discountCode } = useCart();
  const formRef = useRef<HTMLFormElement>(null);
  const [delivery, setDelivery] =
    useState<(typeof DELIVERY_METHODS)[number]["id"]>("kurier");
  const [point, setPoint] = useState<InPostPoint | null>(null);
  const [isCompany, setIsCompany] = useState(false);
  // Przy kurierze adres firmy zwykle pokrywa się z adresem dostawy, więc
  // domyślnie go kopiujemy; przy paczkomacie adresu dostawy nie ma.
  const [sameAddress, setSameAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsMissing, setTermsMissing] = useState(false);

  // Powrót strzałką z bramki potrafi przywrócić stronę z pamięci przeglądarki
  // (bfcache) razem ze stanem "Składanie zamówienia..." — odblokowujemy przycisk,
  // żeby klient mógł od razu spróbować jeszcze raz.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setSubmitting(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setError(null);

    if (delivery === "paczkomat" && !point) {
      setError("Wybierz paczkomat.");
      return;
    }

    const formData = new FormData(formRef.current);
    const field = (name: string) => String(formData.get(name) ?? "").trim();

    // Ulicę, numer domu i lokal zbieramy osobno, ale zamówienie trzyma jeden
    // adres — składamy go w zwykłym polskim zapisie „Długa 12/3”.
    const composeAddress = (street: string, building: string, apartment: string) => {
      const number = field(building) + (field(apartment) ? `/${field(apartment)}` : "");
      return [field(street), number].filter(Boolean).join(" ");
    };
    const address = composeAddress("street", "building", "apartment");

    if (isCompany && !isValidNip(field("companyNip"))) {
      setError("Sprawdź NIP — powinien mieć 10 cyfr.");
      return;
    }

    const copyDelivery = delivery === "kurier" && sameAddress;
    const company = isCompany
      ? {
          name: field("companyName"),
          nip: field("companyNip"),
          address: copyDelivery ? address : composeAddress("companyStreet", "companyBuilding", "companyApartment"),
          postalCode: field(copyDelivery ? "postalCode" : "companyPostalCode"),
          city: field(copyDelivery ? "city" : "companyCity"),
        }
      : null;

    setSubmitting(true);

    try {
      const result = await createOrder({
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        deliveryMethod: delivery,
        address,
        postalCode: String(formData.get("postalCode") ?? ""),
        city: String(formData.get("city") ?? ""),
        inpostPoint: point ? formatInPostPoint(point) : "",
        acceptedTerms: formData.get("acceptTerms") === "on",
        newsletter: formData.get("newsletter") === "on",
        company,
        items: items.map(({ slug, size, quantity }) => ({ slug, size, quantity })),
        discountCode,
        previousOrderNumber: readPendingOrder(),
      });

      if ("error" in result) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      // Zamówienie jest już w bazie (płatność "oczekuje"), ale koszyka nie
      // czyścimy — klient może wrócić z bramki bez płacenia i spróbować jeszcze
      // raz. Czyści go /kasa/potwierdzenie, gdy płatność się zaksięguje.
      writePendingOrder(result.orderNumber);
      window.location.href = result.redirectUrl;
    } catch {
      setError("Nie udało się złożyć zamówienia. Spróbuj ponownie.");
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !submitting) {
    return (
      <section className="flex min-h-[calc(100svh-3.5rem)] w-full flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
        <span className="text-xs tracking-[0.3em] text-black/40">KASA</span>
        <h1 className="font-display text-5xl uppercase tracking-tight">
          Koszyk jest pusty
        </h1>
        <p className="max-w-xs text-sm leading-relaxed text-black/50">
          Dodaj produkty do koszyka, żeby przejść do kasy.
        </p>
        <Link
          href="/sklep"
          className="mt-4 inline-flex w-fit items-center gap-3 border border-black/30 px-7 py-4 text-sm tracking-[0.15em] transition-colors hover:border-black hover:bg-black hover:text-white"
        >
          ZOBACZ KOLEKCJE
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 bg-white px-6 py-16 text-black sm:px-12 lg:flex-row lg:items-start lg:gap-20 lg:px-20 lg:py-20">
      <form
        ref={formRef}
        id="checkout-form"
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col gap-12"
      >
        <div className="flex flex-col gap-3">
          <span className="text-xs tracking-[0.3em] text-black/40">
            KASA
          </span>
          <h1 className="font-display text-5xl uppercase tracking-tight">
            Dane zamówienia
          </h1>
        </div>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-xs tracking-[0.3em] text-black/40">
            KONTAKT
          </legend>
          <input
            name="email"
            autoComplete="email"
            type="email"
            required
            placeholder="E-mail"
            className="border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
          />
          <input
            name="phone"
            autoComplete="tel"
            type="tel"
            required
            placeholder="Telefon"
            className="border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
          />
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-xs tracking-[0.3em] text-black/40">
            ODBIORCA
          </legend>
          <div className="flex gap-4">
            <input
              name="firstName"
              autoComplete="given-name"
              type="text"
              required
              placeholder="Imię"
              className="w-full border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
            />
            <input
              name="lastName"
              autoComplete="family-name"
              type="text"
              required
              placeholder="Nazwisko"
              className="w-full border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-xs tracking-[0.3em] text-black/40">
            DOSTAWA
          </legend>

          <div className="flex gap-3">
            {DELIVERY_METHODS.map((method) => (
              <label
                key={method.id}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-3 border px-4 py-3 text-sm transition-colors ${
                  delivery === method.id
                    ? "border-black"
                    : "border-black/20 hover:border-black/40"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={method.id}
                  checked={delivery === method.id}
                  onChange={() => setDelivery(method.id)}
                  className="accent-black"
                />
                {method.label}
              </label>
            ))}
          </div>

          {delivery === "kurier" ? (
            <>
              <input
                name="street"
                type="text"
                required
                autoComplete="address-line1"
                placeholder="Ulica"
                className="border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
              />
              <div className="flex gap-4">
                <input
                  name="building"
                  autoComplete="off"
                  type="text"
                  required
                  placeholder="Nr domu"
                  className="w-full border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
                />
                <input
                  name="apartment"
                  autoComplete="off"
                  type="text"
                  placeholder="Nr lokalu"
                  className="w-full border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
                />
              </div>
              <div className="flex gap-4">
                <input
                  name="postalCode"
                  autoComplete="postal-code"
                  type="text"
                  required
                  placeholder="Kod pocztowy"
                  className="w-full border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
                />
                <input
                  name="city"
                  autoComplete="address-level2"
                  type="text"
                  required
                  placeholder="Miasto"
                  className="w-full border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
                />
              </div>
            </>
          ) : (
            <InPostGeowidget value={point} onSelect={setPoint} />
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-xs tracking-[0.3em] text-black/40">
            FAKTURA
          </legend>
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={isCompany}
              onChange={(e) => setIsCompany(e.target.checked)}
              className="h-4 w-4 shrink-0 accent-black"
            />
            Kupuję na firmę (faktura VAT)
          </label>

          {isCompany && (
            <>
              <input
                name="companyName"
                type="text"
                required
                autoComplete="organization"
                placeholder="Nazwa firmy"
                className={INPUT}
              />
              <input
                name="companyNip"
                type="text"
                required
                inputMode="numeric"
                placeholder="NIP"
                className={INPUT}
              />
              {delivery === "kurier" && (
                <label className="flex cursor-pointer items-center gap-3 text-sm text-black/70">
                  <input
                    type="checkbox"
                    checked={sameAddress}
                    onChange={(e) => setSameAddress(e.target.checked)}
                    className="h-4 w-4 shrink-0 accent-black"
                  />
                  Adres firmy taki sam jak adres dostawy
                </label>
              )}
              {(delivery === "paczkomat" || !sameAddress) && (
                <>
                  <input
                    name="companyStreet"
                    type="text"
                    required
                    placeholder="Ulica"
                    className={INPUT}
                  />
                  <div className="flex gap-4">
                    <input
                      name="companyBuilding"
                      type="text"
                      required
                      placeholder="Nr domu"
                      className={INPUT}
                    />
                    <input
                      name="companyApartment"
                      type="text"
                      placeholder="Nr lokalu"
                      className={INPUT}
                    />
                  </div>
                  <div className="flex gap-4">
                    <input
                      name="companyPostalCode"
                      type="text"
                      required
                      placeholder="Kod pocztowy"
                      className={INPUT}
                    />
                    <input
                      name="companyCity"
                      type="text"
                      required
                      placeholder="Miasto"
                      className={INPUT}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-xs tracking-[0.3em] text-black/40">
            PŁATNOŚĆ
          </legend>
          <ul className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map(({ label, Icon }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-2 border border-black/20 px-2 py-4 text-xs tracking-widest uppercase"
              >
                <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
                {label}
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-2 text-xs text-black/50">
            <Lock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            Bezpieczna płatność online HotPay
          </p>
        </fieldset>

        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-black/70">
          <input
            name="acceptTerms"
            type="checkbox"
            required
            aria-describedby="terms-error"
            // Zamiast dymka przeglądarki pokazujemy własny komunikat pod zgodą.
            onInvalid={(e) => {
              e.preventDefault();
              setTermsMissing(true);
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            onChange={(e) => {
              if (e.currentTarget.checked) setTermsMissing(false);
            }}
            className="mt-1 h-4 w-4 shrink-0 accent-black"
          />
          <span>
            Akceptuję{" "}
            <Link
              href="/regulamin"
              target="_blank"
              className="text-black underline underline-offset-4 hover:text-black/60"
            >
              Regulamin sklepu
            </Link>{" "}
            oraz{" "}
            <Link
              href="/polityka-prywatnosci"
              target="_blank"
              className="text-black underline underline-offset-4 hover:text-black/60"
            >
              Politykę prywatności
            </Link>
            .{" "}
            <span aria-hidden="true" className="text-red-700">
              *
            </span>
          </span>
        </label>
        {termsMissing && (
          <p id="terms-error" className="-mt-8 pl-7 text-xs text-red-700">
            Zaakceptuj regulamin i politykę prywatności, żeby złożyć zamówienie.
          </p>
        )}
        {/* Zgoda marketingowa musi być osobna i domyślnie odznaczona (RODO). */}
        <label className="-mt-8 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-black/70">
          <input
            name="newsletter"
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-black"
          />
          <span>
            Chcę dostawać newsletter z nowościami i kod -10% na kolejne
            zakupy. Wyślemy mail z linkiem potwierdzającym.
          </span>
        </label>
        <p className="-mt-8 text-xs text-black/40">
          <span className="text-red-700">*</span> Pole wymagane
        </p>
      </form>

      <div className="w-full shrink-0 lg:w-80">
        <OrderSummary
          subtotal={subtotal}
          items={items}
        >
          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="mt-2 w-full bg-black py-4 text-sm tracking-[0.15em] text-white uppercase transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {submitting ? "Składanie zamówienia..." : "Zapłać i zamów"}
          </button>
          {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
        </OrderSummary>
      </div>
    </section>
  );
}
