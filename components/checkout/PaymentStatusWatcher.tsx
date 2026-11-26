"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";

// Notyfikacja HotPay zwykle dociera kilka sekund po powrocie klienta, więc przy
// statusie "oczekuje" odświeżamy stronę przez około minutę, zamiast kazać mu
// klikać F5. Koszyk czyścimy dopiero przy opłaconym zamówieniu — przy nieudanej
// albo przerwanej płatności ma na klienta czekać.
const REFRESH_EVERY_MS = 4000;
const MAX_REFRESHES = 15;

export default function PaymentStatusWatcher({ status }: { status: string | undefined }) {
  const router = useRouter();
  const { clear } = useCart();

  useEffect(() => {
    if (status === "oplacone") clear();
    // clear zmienia się przy każdym renderze providera — reagujemy tylko na status.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (status !== "oczekuje") return;
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      router.refresh();
      if (count >= MAX_REFRESHES) window.clearInterval(timer);
    }, REFRESH_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [status, router]);

  return null;
}
