import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

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
