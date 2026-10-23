import "server-only";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin-credentials";

/**
 * Zapisuje (albo odświeża) konto klienta przy logowaniu. Admin nie jest
 * klientem, więc go pomijamy — inaczej zawyżałby licznik kont w panelu.
 * Błąd zapisu nie może zablokować logowania, dlatego go połykamy: brak wpisu
 * w statystykach to mniejsze zło niż klient, który nie może się zalogować.
 */
export async function recordSignIn(user: {
  email: string;
  name?: string | null;
  provider: string;
}) {
  const email = user.email.trim().toLowerCase();
  if (isAdminEmail(email)) return null;

  try {
    return await prisma.user.upsert({
      where: { email },
      update: {
        name: user.name ?? undefined,
        provider: user.provider,
        loginCount: { increment: 1 },
        lastLoginAt: new Date(),
      },
      create: { email, name: user.name ?? null, provider: user.provider },
    });
  } catch (error) {
    console.error("Nie udało się zapisać logowania klienta:", error);
    return null;
  }
}

/**
 * Konto zalogowanego klienta do przypięcia zamówienia. Sesja w JWT mogła
 * powstać przed wprowadzeniem tabeli, więc brakujący wpis zakładamy tutaj.
 */
export async function findOrCreateUserId(email: string, name?: string | null) {
  const normalized = email.trim().toLowerCase();
  if (isAdminEmail(normalized)) return null;

  try {
    const user = await prisma.user.upsert({
      where: { email: normalized },
      update: {},
      create: { email: normalized, name: name ?? null, provider: "nieznany" },
      select: { id: true },
    });
    return user.id;
  } catch (error) {
    console.error("Nie udało się powiązać zamówienia z kontem:", error);
    return null;
  }
}
