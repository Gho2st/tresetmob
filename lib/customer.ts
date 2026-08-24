import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Sprawdza, czy klient jest zalogowany. Używane w app/(site)/konto/layout.tsx —
 * w przeciwieństwie do panelu admina nie sprawdza żadnej allow-listy, każdy
 * zalogowany przez Google użytkownik ma dostęp do własnego konta.
 */
export async function requireUser() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/logowanie");
  }

  return session;
}
