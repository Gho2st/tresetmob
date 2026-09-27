import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import { verifyAdminCredentials } from "@/lib/admin-credentials";

// Provider bez kluczy wywala się dopiero w momencie kliknięcia przycisku, więc
// dokładamy Facebooka tylko wtedy, gdy jest skonfigurowany. Strona logowania
// czyta tę samą flagę i po prostu nie pokazuje przycisku, którego nie ma czym
// obsłużyć.
export const FACEBOOK_ENABLED = Boolean(
  process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET,
);

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    ...(FACEBOOK_ENABLED
      ? [
          Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
    // Logowanie e-mail+hasło TYLKO dla admina (ADMIN_EMAILS + ADMIN_CREDENTIALS) —
    // klienci sklepu logują się wyłącznie przez OAuth, patrz app/(site)/logowanie.
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const valid = await verifyAdminCredentials(email, password);
        if (!valid) return null;

        return { id: email, email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // Tożsamość klienta stoi u nas wyłącznie na adresie e-mail: po nim
    // dopasowujemy zamówienia (lib/orders.ts) i sprawdzamy allow-listę admina
    // (lib/admin.ts). Facebook potrafi e-maila nie oddać — konto założone na
    // numer telefonu albo cofnięta zgoda. Taka sesja przeszłaby logowanie, po
    // czym requireUser odbiłby klienta z powrotem na /logowanie bez słowa
    // wyjaśnienia, więc odrzucamy ją tutaj i mówimy, co się stało.
    signIn({ user }) {
      if (!user.email) return "/logowanie?blad=brak-emaila";
      return true;
    },
  },
});
