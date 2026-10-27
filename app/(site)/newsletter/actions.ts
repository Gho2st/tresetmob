"use server";

import { redirect } from "next/navigation";
import { confirm, subscribe, unsubscribe } from "@/lib/newsletter";

export type SubscribeState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string };

export async function subscribeToNewsletter(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  // Ukryte pole — człowiek go nie widzi, bot wypełnia wszystko. Udajemy
  // sukces, żeby bot nie miał powodu próbować inaczej.
  if (formData.get("website")) return { status: "ok" };

  const result = await subscribe(String(formData.get("email") ?? ""), "stopka");
  return result.ok
    ? { status: "ok" }
    : { status: "error", message: "Podaj poprawny adres e-mail." };
}

// Potwierdzenie i wypis idą przyciskiem, nie samym wejściem w link — skanery
// poczty otwierają linki z maili i „klikałyby” je za klienta.
export async function confirmSubscription(token: string) {
  await confirm(token);
  redirect(`/newsletter/potwierdz?token=${token}`);
}

export async function unsubscribeFromNewsletter(token: string) {
  await unsubscribe(token);
  redirect(`/newsletter/wypisz?token=${token}`);
}
