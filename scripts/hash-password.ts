// Generuje wpis do ADMIN_CREDENTIALS w .env.local.
// Użycie: npm run hash-password -- admin@example.com "MojeHaslo123"
import { hashPassword } from "../lib/password";

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Użycie: npm run hash-password -- "email@domena.pl" "haslo"');
    process.exit(1);
  }

  const hash = await hashPassword(password);
  console.log("\nDodaj (lub dopisz po przecinku) do ADMIN_CREDENTIALS w .env.local:\n");
  console.log(`${email.trim().toLowerCase()}:${hash}`);
}

main();
