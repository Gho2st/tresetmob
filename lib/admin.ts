import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export { isAdminEmail, verifyAdminCredentials } from "@/lib/admin-credentials";
import { isAdminEmail } from "@/lib/admin-credentials";

/**
 * Sprawdza sesję i uprawnienia admina. Wywoływane w app/admin/layout.tsx
 * ORAZ na początku każdej Server Action w app/admin/**\/actions.ts — Proxy
 * (proxy.ts) robi tylko optymistyczny redirect, to jest właściwa autoryzacja.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!isAdminEmail(session?.user?.email)) {
    redirect("/admin/login");
  }

  return session;
}
