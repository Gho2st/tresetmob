import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { CONTACT, RETURN_ADDRESS, RETURN_FORM_URL } from "@/lib/contact";
import { SHOP_POLICY } from "@/lib/shop-policy";

export const metadata: Metadata = { title: "Zwroty i reklamacje" };

const FACTS = [
  { value: `${SHOP_POLICY.returnDays} dni`, label: "na zwrot od otrzymania przesyłki" },
  { value: "Na Twój koszt", label: "paczkę odsyłasz samodzielnie" },
  { value: `Do ${SHOP_POLICY.refundDays} dni`, label: "na zwrot pieniędzy" },
];

const NOTES = [
  "Przesyłki wysłane na inny adres niż powyższy lub nadane z niepoprawnym numerem telefonu nie będą odbierane.",
  "Nie przyjmujemy przesyłek za pobraniem.",
  "Ze względów higienicznych zwrotowi ani wymianie nie podlega bielizna.",
];

const linkClass = "text-black underline underline-offset-4 hover:text-black/60";

export default function Zwroty() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-14 bg-white px-6 py-16 text-black sm:px-12 lg:px-0 lg:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.3em] text-black/40">OBSŁUGA</span>
        <h1 className="font-bebas text-5xl uppercase tracking-tight">
          Zwroty i reklamacje
        </h1>
      </div>

      <div className="grid grid-cols-1 divide-y divide-black/10 border border-black/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {FACTS.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-1 p-6">
            <span className="font-bebas text-3xl uppercase tracking-tight">
              {fact.value}
            </span>
            <span className="text-xs text-black/50">{fact.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-xs tracking-[0.3em] text-black/40">
          JAK ZWRÓCIĆ PRODUKT
        </h2>

        <ol className="flex flex-col divide-y divide-black/10 border-y border-black/10">
          <li className="flex gap-6 py-6">
            <span className="font-bebas text-2xl leading-none text-black/30">01</span>
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed font-semibold text-black">
                Pobierz i wypełnij formularz zwrotu.
              </p>
              <a
                href={RETURN_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-3 bg-black px-6 py-3 text-xs tracking-[0.15em] text-white uppercase transition-colors hover:bg-neutral-800"
              >
                <Download size={16} strokeWidth={1.5} aria-hidden="true" />
                Formularz zwrotu (PDF)
              </a>
            </div>
          </li>

          <li className="flex gap-6 py-6">
            <span className="font-bebas text-2xl leading-none text-black/30">02</span>
            <p className="text-sm leading-relaxed text-black/70">
              <span className="font-semibold text-black">
                Zapakuj produkty starannie i dołącz formularz oraz dowód zakupu
                (paragon lub fakturę).
              </span>{" "}
              Zwracane produkty nie mogą nosić śladów użytkowania.
            </p>
          </li>

          <li className="flex gap-6 py-6">
            <span className="font-bebas text-2xl leading-none text-black/30">03</span>
            <div className="flex w-full flex-col gap-4">
              <p className="text-sm leading-relaxed text-black/70">
                <span className="font-semibold text-black">
                  Odeślij paczkę na swój koszt
                </span>{" "}
                na adres:
              </p>
              <address className="flex flex-col gap-1 border border-black/10 p-5 text-sm leading-relaxed not-italic">
                <span>{RETURN_ADDRESS.street}</span>
                <span>{RETURN_ADDRESS.city}</span>
                <a
                  href={RETURN_ADDRESS.phoneHref}
                  className="w-fit underline underline-offset-4 hover:text-black/60"
                >
                  tel. {RETURN_ADDRESS.phone}
                </a>
              </address>
            </div>
          </li>
        </ol>

        <ul className="flex flex-col gap-2 border-l-2 border-black pl-4 text-sm leading-relaxed text-black/70">
          {NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs tracking-[0.3em] text-black/40">WYMIANA</h2>
        <p className="text-sm leading-relaxed text-black/70">
          Chcesz inny rozmiar lub model? Masz na to {SHOP_POLICY.exchangeDays} dni
          od otrzymania zamówienia. Odeślij produkt tak samo jak przy zwrocie,
          a w formularzu wpisz, na jaki rozmiar lub model chcesz go wymienić.
          Koszt odesłania pokrywasz Ty.
        </p>
        <p className="text-sm leading-relaxed text-black/70">
          Wymianę zrealizujemy niezwłocznie, najpóźniej w ciągu 14 dni od
          otrzymania paczki. Jeśli wybranego produktu nie będzie na stanie,
          skontaktujemy się z Tobą w sprawie terminu.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs tracking-[0.3em] text-black/40">ZWROT PIENIĘDZY</h2>
        <p className="text-sm leading-relaxed text-black/70">
          Zwrotu płatności dokonamy w ciągu {SHOP_POLICY.refundDays} dni od
          otrzymania paczki z formularzem, przy użyciu tej samej metody
          płatności, której użyto przy zamówieniu.
        </p>
        <p className="text-sm leading-relaxed text-black/70">
          Jeśli zwracasz wszystkie produkty z zamówienia, zwrócimy Ci pełną
          zapłaconą kwotę. Przy zwrocie częściowym otrzymasz wartość odesłanych
          produktów.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs tracking-[0.3em] text-black/40">REKLAMACJE</h2>
        <p className="text-sm leading-relaxed text-black/70">
          Produkt możesz zareklamować przez {SHOP_POLICY.complaintYears} lata od
          dnia otrzymania, jeśli ma wadę, jest niekompletny lub niezgodny z
          opisem.
        </p>
        <p className="text-sm leading-relaxed text-black/70">
          Napisz na{" "}
          <a href={`mailto:${CONTACT.email}`} className={linkClass}>
            {CONTACT.email}
          </a>{" "}
          — podaj numer zamówienia, opisz problem i najlepiej dołącz zdjęcie.
          Odpowiemy w ciągu {SHOP_POLICY.complaintResponseDays} dni. Jeśli do
          rozpatrzenia reklamacji potrzebny będzie produkt, poprosimy o
          odesłanie go na adres podany wyżej.
        </p>
      </div>

      <div className="border border-black/10 p-6 text-sm leading-relaxed text-black/70">
        Pełne zasady znajdziesz w{" "}
        <Link href="/regulamin#wymiana" className={linkClass}>
          Regulaminie sklepu
        </Link>
        . Masz inne pytania?{" "}
        <Link href="/centrum-pomocy" className={linkClass}>
          Zajrzyj do centrum pomocy
        </Link>
        .
      </div>
    </section>
  );
}
