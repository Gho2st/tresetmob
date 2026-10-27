import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/hotpay";
import type { Discount } from "@/lib/discounts";
import {
  sendNewsletterCampaignEmail,
  sendNewsletterConfirmEmail,
  sendNewsletterWelcomeEmail,
  type UnsubscribeLinks,
} from "@/lib/mail";

export const NEWSLETTER_DISCOUNT: Omit<Discount, "code"> = {
  label: "-10%",
  type: "percent",
  value: 10,
};

const RESEND_AFTER_MS = 10 * 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return EMAIL_RE.test(email) && email.length <= 254;
}

function unsubscribeLinks(token: string): UnsubscribeLinks {
  return {
    pageUrl: `${siteUrl()}/newsletter/wypisz?token=${token}`,
    oneClickUrl: `${siteUrl()}/api/newsletter/wypisz?token=${token}`,
  };
}

/** Bez 0/O i 1/I — kod przepisuje się z maila ręcznie. */
function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return `NEWS-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

/**
 * Zapis (albo ponowny zapis) i mail z linkiem potwierdzającym. Już aktywnego
 * subskrybenta nie ruszamy — inaczej każdy mógłby „odświeżać” cudzy zapis.
 * Odpowiedź dla formularza jest ta sama niezależnie od stanu, żeby z zewnątrz
 * nie dało się sprawdzić, czy dany adres jest na liście.
 */
export async function subscribe(rawEmail: string, source: "stopka" | "kasa") {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email)) return { ok: false as const };

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });
  if (existing?.status === "aktywny") return { ok: true as const };
  // Formularz da się wysłać z dowolnym adresem, więc bez tego ktoś mógłby
  // zasypać cudzą skrzynkę mailami potwierdzającymi.
  if (
    existing?.status === "oczekuje" &&
    Date.now() - existing.createdAt.getTime() < RESEND_AFTER_MS
  ) {
    return { ok: true as const };
  }

  const subscriber = existing
    ? await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        // createdAt przesuwamy, żeby limit ponownej wysyłki liczył się od teraz.
        data: { status: "oczekuje", unsubscribedAt: null, createdAt: new Date() },
      })
    : await prisma.newsletterSubscriber.create({ data: { email, source } });

  await sendNewsletterConfirmEmail(
    email,
    `${siteUrl()}/newsletter/potwierdz?token=${subscriber.token}`,
  );
  return { ok: true as const };
}

export function findSubscriberByToken(token: string) {
  if (!token) return null;
  return prisma.newsletterSubscriber.findUnique({ where: { token } });
}

/**
 * Potwierdzenie zapisu: aktywujemy wpis i wydajemy kod. Kod powstaje tylko
 * raz na adres — wypisanie się i ponowny zapis nie dają drugiego rabatu.
 */
export async function confirm(token: string) {
  const subscriber = await findSubscriberByToken(token);
  if (!subscriber) return null;
  if (subscriber.status === "aktywny") return subscriber;

  const isFirstConfirmation = !subscriber.discountCode;
  const updated = await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: {
      status: "aktywny",
      confirmedAt: new Date(),
      unsubscribedAt: null,
      discountCode: subscriber.discountCode ?? generateCode(),
    },
  });

  if (isFirstConfirmation && updated.discountCode) {
    await sendNewsletterWelcomeEmail(
      updated.email,
      updated.discountCode,
      unsubscribeLinks(updated.token),
    );
  }
  return updated;
}

export async function unsubscribe(token: string) {
  const subscriber = await findSubscriberByToken(token);
  if (!subscriber) return null;
  if (subscriber.status === "wypisany") return subscriber;
  return prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { status: "wypisany", unsubscribedAt: new Date() },
  });
}

/**
 * Kod z newslettera jako rabat — tylko potwierdzony i jeszcze niewykorzystany.
 * Wypisanie się nie unieważnia kodu: rabat został już obiecany.
 */
export async function findNewsletterDiscount(
  code: string,
): Promise<Discount | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized.startsWith("NEWS-")) return null;
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { discountCode: normalized },
  });
  if (!subscriber?.confirmedAt || subscriber.discountUsedAt) return null;
  return { code: normalized, ...NEWSLETTER_DISCOUNT };
}

/** Wołane z webhooka po opłaceniu — od tej chwili kod jest zużyty. */
export async function markNewsletterCodeUsed(code: string | null) {
  if (!code?.startsWith("NEWS-")) return;
  await prisma.newsletterSubscriber.updateMany({
    where: { discountCode: code, discountUsedAt: null },
    data: { discountUsedAt: new Date() },
  });
}

/**
 * Wysyłka po kolei, nie równolegle — skrzynki SMTP na hostingu limitują
 * połączenia, a przy kilkuset adresach i tak mieści się to w czasie funkcji.
 */
export async function sendCampaign(subject: string, body: string) {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: "aktywny" },
    select: { email: true, token: true },
  });

  let sent = 0;
  for (const subscriber of subscribers) {
    const ok = await sendNewsletterCampaignEmail(
      subscriber.email,
      subject,
      body,
      unsubscribeLinks(subscriber.token),
    );
    if (ok) sent += 1;
  }

  await prisma.newsletterCampaign.create({
    data: { subject, body, recipients: sent },
  });
  return { sent, total: subscribers.length };
}

/** Podgląd wiadomości na własną skrzynkę, z działającą (fikcyjną) stopką. */
export function sendCampaignTest(to: string, subject: string, body: string) {
  return sendNewsletterCampaignEmail(
    to,
    `[TEST] ${subject}`,
    body,
    unsubscribeLinks("test"),
  );
}
