import "server-only";
import nodemailer from "nodemailer";
import type { Order, OrderItem } from "@/lib/generated/prisma/client";
import { formatPrice } from "@/lib/cart";
import { CONTACT } from "@/lib/contact";

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
    // Bez tego źle skonfigurowany/nieosiągalny SMTP potrafi wisieć na
    // domyślnych timeoutach OS (dziesiątki sekund) i blokować np. webhook płatności.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });

  return transporter;
}

async function sendMail(
  to: string,
  subject: string,
  html: string,
  headers?: Record<string, string>,
) {
  // Wysyłka maila nie może wywrócić zamówienia/zmiany statusu — logujemy błąd
  // i lecimy dalej, zamiast rzucać wyjątek do wywołującej akcji.
  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
      headers,
    });
    return true;
  } catch (error) {
    console.error(`Nie udało się wysłać maila do ${to}:`, error);
    return false;
  }
}

// Dane firmy wpisuje klient, a trafiają do HTML-a maila — bez tego nazwa
// z „<” rozjechałaby szablon.
function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function invoiceLine(order: OrderWithItems) {
  if (!order.companyName) return "";
  return `<p style="font-size:14px;"><strong>Faktura VAT:</strong> ${escapeHtml(
    [order.companyName, `NIP ${order.companyNip}`, order.companyAddress]
      .filter(Boolean)
      .join(", "),
  )}</p>`;
}

function deliveryLine(order: OrderWithItems) {
  if (order.deliveryMethod === "paczkomat") {
    return `Paczkomat ${order.inpostPoint}`;
  }
  return [order.address, order.postalCode, order.city].filter(Boolean).join(", ");
}

function costRows(order: OrderWithItems) {
  const deliveryCents = order.totalCents - order.subtotalCents + order.discountCents;
  const discountRow =
    order.discountCents > 0
      ? `
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#111;">Rabat</td>
          <td style="padding:4px 0;font-size:14px;color:#111;text-align:right;">-${formatPrice(order.discountCents)}</td>
        </tr>`
      : "";

  return `
    ${discountRow}
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#111;">Dostawa</td>
      <td style="padding:4px 0;font-size:14px;color:#111;text-align:right;">${formatPrice(deliveryCents)}</td>
    </tr>
    <tr>
      <td style="padding-top:12px;border-top:1px solid #eee;font-size:14px;font-weight:bold;">Razem</td>
      <td style="padding-top:12px;border-top:1px solid #eee;font-size:14px;font-weight:bold;text-align:right;">${formatPrice(order.totalCents)}</td>
    </tr>`;
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
        Tresetmob · ${CONTACT.email}
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
      ${costRows(order)}
    </table>
    <p style="font-size:14px;"><strong>Adres dostawy:</strong> ${deliveryLine(order)}</p>
    ${invoiceLine(order)}
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
      ${costRows(order)}
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

// ---------- newsletter ----------

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 28px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;">${label}</a>`;
}

export type UnsubscribeLinks = {
  /** strona z przyciskiem — link w treści maila */
  pageUrl: string;
  /** endpoint na POST z „wypisz się” w Gmailu/Apple Mail (RFC 8058) */
  oneClickUrl: string;
};

function unsubscribeHeaders(links: UnsubscribeLinks) {
  return {
    "List-Unsubscribe": `<${links.oneClickUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

function unsubscribeFooter(unsubscribeUrl: string) {
  return `<p style="font-size:12px;line-height:1.6;color:#888;margin-top:32px;">
    Dostajesz tę wiadomość, bo zapisałeś(-aś) się do newslettera Tresetmob.
    <a href="${unsubscribeUrl}" style="color:#888;">Wypisz się</a>
  </p>`;
}

export function sendNewsletterConfirmEmail(to: string, confirmUrl: string) {
  const body = `
    <p style="font-size:14px;line-height:1.6;">
      Kliknij poniżej, żeby potwierdzić zapis do newslettera Tresetmob.
      Po potwierdzeniu wyślemy Ci kod -10% na pierwsze zakupy.
    </p>
    <p style="margin:24px 0;">${button(confirmUrl, "Potwierdzam zapis")}</p>
    <p style="font-size:12px;line-height:1.6;color:#888;">
      Jeśli to nie Ty — zignoruj tę wiadomość, nie zapiszemy Cię bez potwierdzenia.
    </p>`;
  return sendMail(
    to,
    "Potwierdź zapis do newslettera — Tresetmob",
    emailShell("Jeszcze jeden klik", body),
  );
}

export function sendNewsletterWelcomeEmail(
  to: string,
  code: string,
  unsubscribe: UnsubscribeLinks,
) {
  const body = `
    <p style="font-size:14px;line-height:1.6;">
      Dzięki za zapis! Oto Twój jednorazowy kod -10% na zakupy w sklepie:
    </p>
    <p style="margin:24px 0;font-size:24px;font-weight:bold;letter-spacing:0.15em;border:1px dashed #111;padding:16px;text-align:center;">${code}</p>
    <p style="font-size:14px;line-height:1.6;">Wpisz go w koszyku przy składaniu zamówienia.</p>
    ${unsubscribeFooter(unsubscribe.pageUrl)}`;
  return sendMail(
    to,
    "Twój kod -10% — Tresetmob",
    emailShell("Witaj w newsletterze", body),
    unsubscribeHeaders(unsubscribe),
  );
}

/**
 * Wiadomość z panelu. Treść to zwykły tekst — puste linie dzielą akapity —
 * więc escapujemy ją i sami składamy HTML, zamiast przyjmować go z formularza.
 */
export function sendNewsletterCampaignEmail(
  to: string,
  subject: string,
  text: string,
  unsubscribe: UnsubscribeLinks,
) {
  const paragraphs = text
    .trim()
    .split(/\n\s*\n/)
    .map(
      (p) =>
        `<p style="font-size:14px;line-height:1.7;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
  return sendMail(
    to,
    subject,
    emailShell(
      escapeHtml(subject),
      paragraphs + unsubscribeFooter(unsubscribe.pageUrl),
    ),
    unsubscribeHeaders(unsubscribe),
  );
}
