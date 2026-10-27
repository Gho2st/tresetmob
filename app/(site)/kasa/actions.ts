"use server";

import { prisma } from "@/lib/prisma";
import { findDiscount, discountAmount, type Discount } from "@/lib/discounts";
import { findNewsletterDiscount, subscribe } from "@/lib/newsletter";
import { after } from "next/server";
import { initHotpayPayment, siteUrl } from "@/lib/hotpay";
import { SHOP_POLICY } from "@/lib/shop-policy";
import { auth } from "@/auth";
import { findOrCreateUserId } from "@/lib/users";
import { isValidNip, normalizeNip } from "@/lib/nip";

// Z przeglądarki przyjmujemy tylko CO klient kupuje (slug, rozmiar, ilość) i
// jaki kod wpisał. Ceny, rabat i sumę liczy serwer z bazy — inaczej podmieniony
// request mógłby przepuścić zamówienie za dowolną kwotę prosto do bramki.
type OrderLine = { slug: string; size: string; quantity: number };

type CreateOrderInput = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  deliveryMethod: "kurier" | "paczkomat";
  address?: string;
  postalCode?: string;
  city?: string;
  inpostPoint?: string;
  acceptedTerms: boolean;
  newsletter?: boolean;
  // Obecne tylko przy zakupie na firmę (faktura VAT).
  company?: {
    name: string;
    nip: string;
    address: string;
    postalCode: string;
    city: string;
  } | null;
  items: OrderLine[];
  discountCode?: string | null;
};

/** Stałe kody z lib/discounts.ts albo jednorazowy kod z newslettera. */
async function resolveDiscount(code: string): Promise<Discount | null> {
  return findDiscount(code) ?? (await findNewsletterDiscount(code));
}

/**
 * Sprawdzenie kodu w podsumowaniu koszyka. Kody z newslettera są w bazie,
 * więc nie da się ich już sprawdzić samą listą po stronie przeglądarki.
 */
export async function checkDiscountCode(code: string) {
  return resolveDiscount(code);
}

// Błąd, którego treść można pokazać klientowi. Zwykłe `throw` z Server Action
// Next na produkcji zamienia na ogólny komunikat, więc te zwracamy jako wartość.
class CheckoutError extends Error {}

export async function createOrder(
  input: CreateOrderInput,
): Promise<{ redirectUrl: string } | { error: string }> {
  try {
    return await placeOrder(input);
  } catch (error) {
    if (error instanceof CheckoutError) return { error: error.message };
    throw error;
  }
}

function generateOrderNumber() {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TM-${Date.now().toString(36).toUpperCase()}${random}`;
}

async function priceLines(lines: OrderLine[]) {
  const products = await prisma.product.findMany({
    where: { slug: { in: [...new Set(lines.map((l) => l.slug))] } },
    include: { variants: true },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  return lines.map((line) => {
    const product = bySlug.get(line.slug);
    if (!product) throw new CheckoutError("Produkt nie jest już dostępny.");
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) {
      throw new CheckoutError("Nieprawidłowa ilość.");
    }
    const variant = product.variants.find((v) => v.size === line.size);
    if (!variant || variant.stock < line.quantity) {
      throw new CheckoutError(`${product.title} (${line.size}) nie jest dostępny w tej ilości.`);
    }

    return {
      productSlug: product.slug,
      title: product.title,
      image: product.images[0] ?? "",
      size: line.size,
      quantity: line.quantity,
      priceCents: product.salePriceCents ?? product.priceCents,
    };
  });
}

async function placeOrder(input: CreateOrderInput) {
  if (!input.email || !input.phone || !input.firstName || !input.lastName) {
    throw new CheckoutError("Uzupełnij dane kontaktowe.");
  }
  if (input.deliveryMethod === "kurier" && (!input.address || !input.postalCode || !input.city)) {
    throw new CheckoutError("Uzupełnij adres dostawy.");
  }
  if (input.deliveryMethod === "paczkomat" && !input.inpostPoint) {
    throw new CheckoutError("Wybierz paczkomat.");
  }
  const company = input.company
    ? {
        name: input.company.name.trim(),
        nip: normalizeNip(input.company.nip),
        address: input.company.address.trim(),
        postalCode: input.company.postalCode.trim(),
        city: input.company.city.trim(),
      }
    : null;
  if (company) {
    if (!company.name || !company.address || !company.postalCode || !company.city) {
      throw new CheckoutError("Uzupełnij dane firmy do faktury.");
    }
    if (!isValidNip(company.nip)) {
      throw new CheckoutError("Nieprawidłowy NIP.");
    }
  }
  if (!input.acceptedTerms) {
    throw new CheckoutError("Zaakceptuj regulamin sklepu.");
  }
  if (input.items.length === 0) {
    throw new CheckoutError("Koszyk jest pusty.");
  }

  const items = await priceLines(input.items);
  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const discount = input.discountCode
    ? await resolveDiscount(input.discountCode)
    : null;
  const discountCents = discount ? Math.round(discountAmount(subtotalCents, discount)) : 0;
  const totalCents = subtotalCents - discountCents + SHOP_POLICY.deliveryCostCents;

  const number = generateOrderNumber();

  // Najpierw inicjujemy płatność — zamówienie zapisujemy dopiero, gdy bramka
  // zwróci link, żeby nie zostawiać "martwych" zamówień po nieudanej inicjalizacji.
  const init = await initHotpayPayment({
    orderNumber: number,
    amountCents: totalCents,
    description: `Zamówienie ${number}`,
    email: input.email,
    returnUrl: `${siteUrl()}/kasa/potwierdzenie?number=${number}`,
  });
  if (!init.ok) {
    throw new CheckoutError(init.error);
  }

  // Zalogowany klient dostaje zamówienie przypięte do konta — panel odróżnia
  // dzięki temu zakupy z konta od zakupów jako gość.
  const session = await auth();
  const userId = session?.user?.email
    ? await findOrCreateUserId(session.user.email, session.user.name)
    : null;

  // Potwierdzenie mailowe wysyła webhook HotPay po zaksięgowaniu płatności.
  await prisma.order.create({
    data: {
      number,
      userId,
      customerEmail: input.email,
      customerName: `${input.firstName} ${input.lastName}`.trim(),
      phone: input.phone,
      deliveryMethod: input.deliveryMethod,
      address: input.address,
      postalCode: input.postalCode,
      city: input.city,
      inpostPoint: input.inpostPoint,
      paymentMethod: "hotpay",
      companyName: company?.name,
      companyNip: company?.nip,
      companyAddress: company
        ? `${company.address}, ${company.postalCode} ${company.city}`
        : undefined,
      paymentStatus: "oczekuje",
      subtotalCents,
      discountCents,
      discountCode: discount?.code,
      totalCents,
      items: { create: items },
    },
  });

  // Zapis z checkboxa w kasie idzie tą samą drogą co ze stopki — z mailem
  // potwierdzającym, bo zgoda musi być potwierdzona. Klient nie czeka na SMTP.
  if (input.newsletter) {
    after(() => subscribe(input.email, "kasa"));
  }

  return { redirectUrl: init.url };
}
