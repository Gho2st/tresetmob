import { SessionProvider } from "next-auth/react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
