"use server";

import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/lib/cart";

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
  paymentMethod: string;
  items: CartItem[];
  subtotalCents: number;
  totalCents: number;
};

function generateOrderNumber() {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TM-${Date.now().toString(36).toUpperCase()}${random}`;
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.email || !input.phone || !input.firstName || !input.lastName) {
    throw new Error("Uzupełnij dane kontaktowe.");
  }
  if (input.deliveryMethod === "kurier" && (!input.address || !input.postalCode || !input.city)) {
    throw new Error("Uzupełnij adres dostawy.");
  }
  if (input.deliveryMethod === "paczkomat" && !input.inpostPoint) {
    throw new Error("Wybierz paczkomat.");
  }
  if (input.items.length === 0) {
    throw new Error("Koszyk jest pusty.");
  }

  const order = await prisma.order.create({
    data: {
      number: generateOrderNumber(),
      customerEmail: input.email,
      customerName: `${input.firstName} ${input.lastName}`.trim(),
      phone: input.phone,
      deliveryMethod: input.deliveryMethod,
      address: input.address,
      postalCode: input.postalCode,
      city: input.city,
      inpostPoint: input.inpostPoint,
      paymentMethod: input.paymentMethod,
      subtotalCents: input.subtotalCents,
      discountCents: Math.max(input.subtotalCents - input.totalCents, 0),
      totalCents: input.totalCents,
      items: {
        create: input.items.map((item) => ({
          productSlug: item.slug,
          title: item.title,
          image: item.image,
          size: item.size,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
      },
    },
  });

  return { number: order.number };
}
