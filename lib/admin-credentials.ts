import "server-only";
import { verifyPassword } from "@/lib/password";

// Wydzielone z lib/admin.ts, żeby auth.ts mogło zweryfikować logowanie e-mail+hasło
// bez importowania lib/admin.ts (ten importuje `auth` z auth.ts — cykl importów).
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

// Format ADMIN_CREDENTIALS: "email:sól:hash,email2:sól2:hash2" — sól i hash to
// jeden token (patrz lib/password.ts), rozdzielamy tylko po pierwszym ":".
function adminCredentials(): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of (process.env.ADMIN_CREDENTIALS ?? "").split(",")) {
    const separatorIndex = pair.indexOf(":");
    if (separatorIndex === -1) continue;
    const email = pair.slice(0, separatorIndex).trim().toLowerCase();
    const hash = pair.slice(separatorIndex + 1).trim();
    if (email && hash) map.set(email, hash);
  }
  return map;
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  if (!isAdminEmail(email)) return false;
  const hash = adminCredentials().get(email.trim().toLowerCase());
  if (!hash) return false;
  return verifyPassword(password, hash);
}
