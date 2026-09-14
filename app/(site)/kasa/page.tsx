"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/cart";
import { INPOST_POINTS } from "@/lib/delivery";
import OrderSummary from "@/components/OrderSummary";
import { createOrder } from "./actions";

const DELIVERY_METHODS = [
  { id: "kurier", label: "Kurier InPost" },
  { id: "paczkomat", label: "Paczkomat InPost" },
] as const;

const PAYMENT_METHODS = [
  { id: "przelewy24", label: "Przelewy24" },
  { id: "stripe", label: "Stripe" },
  { id: "hotpay", label: "HotPay" },
];

export default function Kasa() {
  const { items, subtotal, clear } = useCart();
  const formRef = useRef<HTMLFormElement>(null);
  const [delivery, setDelivery] =
    useState<(typeof DELIVERY_METHODS)[number]["id"]>("kurier");
  const [point, setPoint] = useState("");
  const [payment, setPayment] = useState(PAYMENT_METHODS[0].id);
  const [total, setTotal] = useState(subtotal);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<{ number: string; total: number } | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setError(null);
    setSubmitting(true);

    const formData = new FormData(formRef.current);

    try {
      const result = await createOrder({
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        deliveryMethod: delivery,
        address: String(formData.get("address") ?? ""),
        postalCode: String(formData.get("postalCode") ?? ""),
        city: String(formData.get("city") ?? ""),
        inpostPoint: point,
        paymentMethod: payment,
        acceptedTerms: formData.get("acceptTerms") === "on",
        items,
        subtotalCents: subtotal,
        totalCents: total,
      });
      setOrder({ number: result.number, total });
      clear();
    } catch {
      setError("Nie udało się złożyć zamówienia. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <section className="flex min-h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
        <span className="text-xs tracking-[0.3em] text-black/40">
          ZAMÓWIENIE ZŁOŻONE
        </span>
        <h1 className="font-bebas text-5xl uppercase tracking-tight">
          Dziękujemy!
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-black/50">
          Zamówienie <span className="text-black">{order.number}</span> na
          kwotę <span className="text-black">{formatPrice(order.total)}</span>{" "}
          zostało przyjęte. Potwierdzenie wysłaliśmy na podany adres e-mail.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/sklep"
            className="inline-flex w-fit items-center gap-3 border border-black/30 px-7 py-4 text-sm tracking-[0.15em] transition-colors hover:border-black hover:bg-black hover:text-white"
          >
            WRÓĆ DO ZAKUPÓW
          </Link>
          <Link
            href="/konto/zamowienia"
            className="text-sm tracking-[0.15em] underline underline-offset-4 hover:text-black/60"
          >
            Zobacz moje zamówienia
          </Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex min-h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
        <span className="text-xs tracking-[0.3em] text-black/40">KASA</span>
        <h1 className="font-bebas text-5xl uppercase tracking-tight">
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
          <h1 className="font-bebas text-5xl uppercase tracking-tight">
            Dane zamówienia
          </h1>
        </div>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-xs tracking-[0.3em] text-black/40">
            KONTAKT
          </legend>
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            className="border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
          />
          <input
            name="phone"
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
              type="text"
              required
              placeholder="Imię"
              className="w-full border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
            />
            <input
              name="lastName"
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
                name="address"
                type="text"
                required
                placeholder="Adres"
                className="border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
              />
              <div className="flex gap-4">
                <input
                  name="postalCode"
                  type="text"
                  required
                  placeholder="Kod pocztowy"
                  className="w-full border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
                />
                <input
                  name="city"
                  type="text"
                  required
                  placeholder="Miasto"
                  className="w-full border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
                />
              </div>
            </>
          ) : (
            <select
              required
              value={point}
              onChange={(e) => setPoint(e.target.value)}
              className="border border-black/20 bg-white px-4 py-3 text-sm focus:border-black focus:outline-none"
            >
              <option value="" disabled>
                Wybierz paczkomat
              </option>
              {INPOST_POINTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.address}
                </option>
              ))}
            </select>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-xs tracking-[0.3em] text-black/40">
            PŁATNOŚĆ
          </legend>
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.id}
              className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition-colors ${
                payment === method.id
                  ? "border-black"
                  : "border-black/20 hover:border-black/40"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={payment === method.id}
                onChange={() => setPayment(method.id)}
                className="accent-black"
              />
              {method.label}
            </label>
          ))}
        </fieldset>

        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-black/70">
          <input
            name="acceptTerms"
            type="checkbox"
            required
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
            .
          </span>
        </label>
      </form>

      <div className="w-full shrink-0 lg:w-80">
        <OrderSummary
          subtotal={subtotal}
          shippingLabel="Gratis"
          items={items}
          onTotalChange={setTotal}
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
