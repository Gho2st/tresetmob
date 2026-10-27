import type { Metadata } from "next";
import { findSubscriberByToken } from "@/lib/newsletter";
import { confirmSubscription } from "../actions";
import NewsletterPage, { PRIMARY_BUTTON } from "../NewsletterPage";

export const metadata: Metadata = {
  title: "Potwierdzenie zapisu",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function PotwierdzZapis({ searchParams }: Props) {
  const { token = "" } = await searchParams;
  const subscriber = await findSubscriberByToken(token);

  if (!subscriber) {
    return (
      <NewsletterPage title="Link nieaktywny">
        <p className="max-w-xs text-sm leading-relaxed text-black/50">
          Ten link jest nieprawidłowy. Zapisz się ponownie w stopce strony.
        </p>
      </NewsletterPage>
    );
  }

  if (subscriber.status === "aktywny") {
    return (
      <NewsletterPage title="Jesteś zapisany">
        <p className="max-w-sm text-sm leading-relaxed text-black/50">
          Dzięki! Twój jednorazowy kod -10% wysłaliśmy też mailem.
        </p>
        {subscriber.discountCode && (
          <p
            className={`border border-dashed px-8 py-4 font-display text-3xl tracking-[0.15em] ${
              subscriber.discountUsedAt
                ? "border-black/20 text-black/30 line-through"
                : "border-black"
            }`}
          >
            {subscriber.discountCode}
          </p>
        )}
        {subscriber.discountUsedAt && (
          <p className="text-xs text-black/40">Kod został już wykorzystany.</p>
        )}
      </NewsletterPage>
    );
  }

  return (
    <NewsletterPage title="Potwierdź zapis">
      <p className="max-w-sm text-sm leading-relaxed text-black/50">
        Potwierdź, że chcesz dostawać newsletter na adres{" "}
        <span className="text-black">{subscriber.email}</span>. Od razu
        dostaniesz kod -10% na zakupy.
      </p>
      <form action={confirmSubscription.bind(null, token)}>
        <button type="submit" className={PRIMARY_BUTTON}>
          Potwierdzam zapis
        </button>
      </form>
    </NewsletterPage>
  );
}
