// Bez "server-only" celowo — to czysta funkcja kryptograficzna, używana też
// z poziomu skryptu CLI (scripts/hash-password.ts), poza bundlem Next.js.
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

// Format zapisu: "salt:hash" (oba hex) — bez dodatkowej zależności (bcrypt/bcryptjs),
// scrypt jest wbudowany w Node i proxy.ts w tym projekcie i tak działa na runtime Node.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const hashBuf = Buffer.from(hash, "hex");
  if (hashBuf.length !== derived.length) return false;

  return timingSafeEqual(derived, hashBuf);
}
