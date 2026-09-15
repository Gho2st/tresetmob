import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Props = { searchParams: Promise<{ number?: string }> };

export default async function PotwierdzeniePlatnosci({ searchParams }: Props) {
  const { number } = await searchParams;
  const order = number
    ? await prisma.order.findUnique({ where: { number } })
    : null;

  const status = order?.paymentStatus;

  const { eyebrow, title, message } =
    status === "oplacone"
      ? {
          eyebrow: "PŁATNOŚĆ PRZYJĘTA",
          title: "Dziękujemy!",
          message:
            "Płatność została zaksięgowana. Potwierdzenie zamówienia wysłaliśmy na Twój adres e-mail.",
        }
      : status === "nieudane"
        ? {
            eyebrow: "PŁATNOŚĆ NIEUDANA",
            title: "Coś poszło nie tak",
            message:
              "Płatność nie została zrealizowana. Wróć do koszyka i spróbuj ponownie lub wybierz inną metodę płatności.",
          }
        : {
            eyebrow: "PŁATNOŚĆ W TRAKCIE",
            title: "Prawie gotowe!",
            message:
              "Potwierdzamy Twoją płatność — to zwykle kwestia chwili. Gdy tylko się zaksięguje, wyślemy potwierdzenie zamówienia na e-mail.",
          };

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
      <span className="text-xs tracking-[0.3em] text-black/40">{eyebrow}</span>
      <h1 className="font-bebas text-5xl uppercase tracking-tight">{title}</h1>
      <p className="max-w-sm text-sm leading-relaxed text-black/50">
        {order && (
          <>
            Zamówienie <span className="text-black">{order.number}</span>.{" "}
          </>
        )}
        {message}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/sklep"
          className="inline-flex w-fit items-center gap-3 border border-black/30 px-7 py-4 text-sm tracking-[0.15em] transition-colors hover:border-black hover:bg-black hover:text-white"
        >
          WRÓĆ DO ZAKUPÓW
        </Link>
        <Link
          href="/konto/zamowienia"
          className="text-sm tracking-[0.15em] underline underline-offset-4 hover:text-black/60"
        >
          Zobacz moje zamówienia
        </Link>
      </div>
    </section>
  );
}
