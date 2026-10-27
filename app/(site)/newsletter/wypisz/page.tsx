import type { Metadata } from "next";
import { findSubscriberByToken } from "@/lib/newsletter";
import { unsubscribeFromNewsletter } from "../actions";
import NewsletterPage, { PRIMARY_BUTTON } from "../NewsletterPage";

export const metadata: Metadata = {
  title: "Wypisz się z newslettera",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function WypiszSie({ searchParams }: Props) {
  const { token = "" } = await searchParams;
  const subscriber = await findSubscriberByToken(token);

  if (!subscriber) {
    return (
      <NewsletterPage title="Link nieaktywny">
        <p className="max-w-xs text-sm leading-relaxed text-black/50">
          Ten link jest nieprawidłowy albo nieaktualny.
        </p>
      </NewsletterPage>
    );
  }

  if (subscriber.status === "wypisany") {
    return (
      <NewsletterPage title="Wypisano">
        <p className="max-w-xs text-sm leading-relaxed text-black/50">
          Nie będziemy już wysyłać newslettera na {subscriber.email}.
        </p>
      </NewsletterPage>
    );
  }

  return (
    <NewsletterPage title="Wypisać się?">
      <p className="max-w-sm text-sm leading-relaxed text-black/50">
        Przestaniemy wysyłać newsletter na adres{" "}
        <span className="text-black">{subscriber.email}</span>.
      </p>
      <form action={unsubscribeFromNewsletter.bind(null, token)}>
        <button type="submit" className={PRIMARY_BUTTON}>
          Wypisz mnie
        </button>
      </form>
    </NewsletterPage>
  );
}
