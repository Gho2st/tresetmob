import "server-only";
import nodemailer from "nodemailer";
import type { Order, OrderItem } from "@/lib/generated/prisma/client";
import { formatPrice } from "@/lib/cart";

type OrderWithItems = Order & { items: OrderItem[] };

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendMail(to: string, subject: string, html: string) {
  // Wysyłka maila nie może wywrócić zamówienia/zmiany statusu — logujemy błąd
  // i lecimy dalej, zamiast rzucać wyjątek do wywołującej akcji.
  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Nie udało się wysłać maila do ${to}:`, error);
  }
}

function deliveryLine(order: OrderWithItems) {
  if (order.deliveryMethod === "paczkomat") {
    return `Paczkomat ${order.inpostPoint}`;
  }
  return [order.address, order.postalCode, order.city].filter(Boolean).join(", ");
}

function itemsRows(items: OrderItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#111;">${item.title} (${item.size}) × ${item.quantity}</td>
          <td style="padding:8px 0;font-size:14px;color:#111;text-align:right;">${formatPrice(item.priceCents * item.quantity)}</td>
        </tr>`,
    )
    .join("");
}

function emailShell(title: string, bodyHtml: string) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#111;">
      <div style="background:#000;color:#fff;padding:20px 24px;font-size:20px;font-weight:bold;letter-spacing:0.05em;">
        TRESETMOB
      </div>
      <div style="padding:24px;">
        <h1 style="font-size:18px;margin:0 0 16px;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:24px;border-top:1px solid #eee;font-size:12px;color:#888;">
        Tresetmob · kontakt@tresetmob.pl
      </div>
    </div>`;
}

export async function sendOrderConfirmationEmail(order: OrderWithItems) {
  const body = `
    <p style="font-size:14px;line-height:1.6;">
      Cześć ${order.customerName}, dziękujemy za zamówienie! Oto jego podsumowanie.
    </p>
    <p style="font-size:14px;"><strong>Numer zamówienia:</strong> ${order.number}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${itemsRows(order.items)}
      <tr>
        <td style="padding-top:12px;border-top:1px solid #eee;font-size:14px;font-weight:bold;">Razem</td>
        <td style="padding-top:12px;border-top:1px solid #eee;font-size:14px;font-weight:bold;text-align:right;">${formatPrice(order.totalCents)}</td>
      </tr>
    </table>
    <p style="font-size:14px;"><strong>Dostawa:</strong> ${deliveryLine(order)}</p>
    <p style="font-size:14px;"><strong>Płatność:</strong> ${order.paymentMethod}</p>
    <p style="font-size:14px;line-height:1.6;">
      Status zamówienia możesz śledzić w zakładce „Moje konto” → „Moje zamówienia”.
    </p>`;

  await sendMail(
    order.customerEmail,
    `Potwierdzenie zamówienia ${order.number} — Tresetmob`,
    emailShell("Dziękujemy za zamówienie", body),
  );
}

export async function sendOrderStatusEmail(order: OrderWithItems) {
  const body = `
    <p style="font-size:14px;line-height:1.6;">
      Cześć ${order.customerName}, status Twojego zamówienia
      <strong>${order.number}</strong> zmienił się na:
    </p>
    <p style="font-size:18px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;margin:8px 0 20px;">
      ${order.status}
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${itemsRows(order.items)}
      <tr>
        <td style="padding-top:12px;border-top:1px solid #eee;font-size:14px;font-weight:bold;">Razem</td>
        <td style="padding-top:12px;border-top:1px solid #eee;font-size:14px;font-weight:bold;text-align:right;">${formatPrice(order.totalCents)}</td>
      </tr>
    </table>
    <p style="font-size:14px;line-height:1.6;">
      Szczegóły zamówienia znajdziesz w zakładce „Moje konto” → „Moje zamówienia”.
    </p>`;

  await sendMail(
    order.customerEmail,
    `Status zamówienia ${order.number}: ${order.status}`,
    emailShell("Aktualizacja statusu zamówienia", body),
  );
}
