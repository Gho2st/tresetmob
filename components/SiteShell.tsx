import { SessionProvider } from "next-auth/react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";

// Wspólny szkielet sklepu — używany przez app/(site)/layout.tsx oraz app/not-found.tsx,
// który renderuje się poza grupą (site), więc sam nie dostałby Nav/Footera.
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </CartProvider>
    </SessionProvider>
  );
}
