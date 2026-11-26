import "server-only";
import { prisma } from "@/lib/prisma";

// Nieopłacone zamówienie po godzinie uznajemy za porzucone — jak "Hold stock"
// w WooCommerce. Stany magazynowe schodzą dopiero przy opłaceniu, więc
// porzucenie niczego nie zwalnia, tylko porządkuje panel i konto klienta.
// Spóźniona notyfikacja SUCCESS i tak oznaczy takie zamówienie jako opłacone
// (webhook aktualizuje każde, które nie jest jeszcze "oplacone").
const ABANDON_AFTER_MS = 60 * 60 * 1000;

/**
 * Woła to cron co kwadrans (app/api/cron/abandon-orders) oraz każdy odczyt
 * zamówień, żeby panel i konto klienta były dokładne także między przebiegami.
 * Jedno updateMany — przy braku starych zamówień nic nie zmienia.
 */
export async function abandonStaleOrders() {
  const { count } = await prisma.order.updateMany({
    where: {
      paymentStatus: "oczekuje",
      createdAt: { lt: new Date(Date.now() - ABANDON_AFTER_MS) },
    },
    data: { paymentStatus: "porzucone" },
  });
  return count;
}

/**
 * Klient wrócił z bramki bez płacenia i składa zamówienie jeszcze raz —
 * poprzednia próba z tej samej przeglądarki przestaje być aktualna. E-mail
 * musi się zgadzać, żeby obcy numer zamówienia niczego nie porzucił.
 */
export async function abandonSupersededOrder(number: string, email: string) {
  await prisma.order.updateMany({
    where: {
      number,
      paymentStatus: "oczekuje",
      customerEmail: { equals: email, mode: "insensitive" },
    },
    data: { paymentStatus: "porzucone" },
  });
}

export async function getOrdersForEmail(email: string) {
  await abandonStaleOrders();
  // Porzucone próby to nie zamówienia z punktu widzenia klienta.
  return prisma.order.findMany({
    where: {
      customerEmail: { equals: email, mode: "insensitive" },
      paymentStatus: { not: "porzucone" },
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllOrders() {
  await abandonStaleOrders();
  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}
