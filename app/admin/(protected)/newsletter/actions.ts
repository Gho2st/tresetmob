"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { sendCampaign, sendCampaignTest } from "@/lib/newsletter";

export type CampaignResult = { ok: boolean; message: string };

function validate(subject: string, body: string): string | null {
  if (!subject.trim()) return "Wpisz temat wiadomości.";
  if (!body.trim()) return "Wpisz treść wiadomości.";
  if (subject.length > 150) return "Temat jest za długi (max 150 znaków).";
  return null;
}

export async function sendTestCampaign(
  subject: string,
  body: string,
): Promise<CampaignResult> {
  const session = await requireAdmin();
  const error = validate(subject, body);
  if (error) return { ok: false, message: error };

  const to = session?.user?.email;
  if (!to) return { ok: false, message: "Brak adresu e-mail w sesji." };

  const sent = await sendCampaignTest(to, subject.trim(), body);
  return sent
    ? { ok: true, message: `Wysłano test na ${to}.` }
    : { ok: false, message: "Nie udało się wysłać testu — sprawdź SMTP." };
}

export async function sendNewsletterCampaign(
  subject: string,
  body: string,
): Promise<CampaignResult> {
  await requireAdmin();
  const error = validate(subject, body);
  if (error) return { ok: false, message: error };

  const { sent, total } = await sendCampaign(subject.trim(), body);
  revalidatePath("/admin/newsletter");

  if (total === 0) return { ok: false, message: "Nie ma jeszcze aktywnych subskrybentów." };
  return sent === total
    ? { ok: true, message: `Wysłano do ${sent} osób.` }
    : {
        ok: false,
        message: `Wysłano do ${sent} z ${total} osób — część adresów odrzuciła wiadomość (szczegóły w logach).`,
      };
}
