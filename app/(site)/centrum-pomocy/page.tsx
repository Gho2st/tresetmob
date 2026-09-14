import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";
import { CONTACT } from "@/lib/contact";
import { SHOP_POLICY } from "@/lib/shop-policy";
import { SOCIAL_HANDLE, SOCIAL_LINKS } from "@/lib/social";

export const metadata: Metadata = { title: "Centrum pomocy" };

const INSTAGRAM_URL = SOCIAL_LINKS.find((social) => social.id === "instagram")?.href;

const CATEGORIES = [
  {
    title: "Zamówienia",
    items: [
      {
        question: "Jak sprawdzić status zamówienia?",
        answer:
          "Historię i status zamówień znajdziesz w zakładce „Moje konto” → „Moje zamówienia” po zalogowaniu. Na bieżąco aktualizujemy tam status: nowe, w realizacji, wysłane, dostarczone.",
      },
      {
        question: "Czy mogę zmienić lub anulować zamówienie?",
        answer: `Tak, dopóki zamówienie nie zostało wysłane — napisz lub zadzwoń do nas jak najszybciej. Po wysyłce możesz skorzystać z prawa zwrotu w ciągu ${SHOP_POLICY.returnDays} dni od otrzymania paczki.`,
      },
      {
        question: "Nie dostałem potwierdzenia zamówienia — co robić?",
        answer:
          "Sprawdź folder spam. Jeśli wiadomości nadal nie widzisz, napisz do nas z podanym adresem e-mail i przybliżoną godziną złożenia zamówienia.",
      },
    ],
  },
  {
    title: "Dostawa",
    items: [
      {
        question: "Ile kosztuje dostawa?",
        answer:
          "Dostawa jest bezpłatna — niezależnie od wybranej metody (kurier InPost lub Paczkomat InPost) i wartości zamówienia.",
      },
      {
        question: "Ile trwa realizacja i dostawa zamówienia?",
        answer: `Zamówienia wysyłamy w ciągu ${SHOP_POLICY.dispatchWorkdays} dni roboczych od zaksięgowania płatności (od poniedziałku do piątku). Doręczenie przez InPost trwa zwykle 1–2 dni robocze.`,
      },
      {
        question: "Czy dostarczacie za granicę?",
        answer: "Obecnie realizujemy dostawy tylko na terenie Polski.",
      },
    ],
  },
  {
    title: "Płatności",
    items: [
      {
        question: "Jakie metody płatności są dostępne?",
        answer:
          "Płacisz online: szybkim przelewem (pay-by-link), BLIK-iem, kartą płatniczą, Google Pay lub Apple Pay.",
      },
      {
        question: "Czy płatność online jest bezpieczna?",
        answer:
          "Tak — płatności przetwarzane są przez zewnętrznego, licencjonowanego operatora płatności. Nie przechowujemy danych Twojej karty.",
      },
    ],
  },
  {
    title: "Zwroty i reklamacje",
    items: [
      {
        question: "Jak zwrócić produkt?",
        answer: `Masz ${SHOP_POLICY.returnDays} dni od otrzymania przesyłki na zwrot bez podania przyczyny. Wypełnij formularz, dołącz go do paczki i odeślij ją na nasz adres — instrukcję krok po kroku znajdziesz na stronie Zwroty i reklamacje.`,
      },
      {
        question: "Czy mogę wymienić rozmiar?",
        answer: `Tak, w ciągu ${SHOP_POLICY.exchangeDays} dni od otrzymania zamówienia. Odeślij produkt tak jak przy zwrocie i wpisz w formularzu, na jaki rozmiar lub model chcesz go wymienić.`,
      },
      {
        question: "Produkt jest wadliwy — co teraz?",
        answer: `Napisz na ${CONTACT.email} z numerem zamówienia i opisem (najlepiej ze zdjęciem) — odpowiemy w ciągu ${SHOP_POLICY.complaintResponseDays} dni. Jeśli do rozpatrzenia reklamacji potrzebny będzie produkt, poprosimy o jego odesłanie.`,
      },
    ],
  },
  {
    title: "Rozmiary",
    items: [
      {
        question: "Jak dobrać rozmiar?",
        answer: `Na każdej stronie produktu, obok wyboru rozmiaru, znajdziesz link „Tablica rozmiarów” z wymiarami w centymetrach. Rzeczywiste wymiary mogą różnić się od podanych o maksymalnie ${SHOP_POLICY.sizeToleranceCm} cm.`,
      },
      {
        question: "Rozmiar którego szukam jest niedostępny — co robić?",
        answer: `Wyprzedane rozmiary czasem wracają do sprzedaży. Napisz do nas na Instagramie @${SOCIAL_HANDLE}, a damy znać, gdy dany produkt wróci.`,
      },
    ],
  },
];

const linkClass = "text-black underline underline-offset-4 hover:text-black/60";

export default function CentrumPomocy() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-12 bg-white px-6 py-16 text-black sm:px-12 lg:px-0 lg:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.3em] text-black/40">
          OBSŁUGA
        </span>
        <h1 className="font-bebas text-5xl uppercase tracking-tight">
          Centrum pomocy
        </h1>
        <p className="text-sm text-black/50">
          Najczęstsze pytania o zamówienia, dostawę, płatności i zwroty.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {CATEGORIES.map((category) => (
          <div key={category.title} className="flex flex-col gap-3">
            <h2 className="text-xs tracking-[0.3em] text-black/40">
              {category.title.toUpperCase()}
            </h2>
            <FaqAccordion items={category.items} />
          </div>
        ))}
      </div>

      <div className="border border-black/10 p-6 text-sm leading-relaxed text-black/70">
        Nie znalazłeś odpowiedzi? Napisz na{" "}
        <a href={`mailto:${CONTACT.email}`} className={linkClass}>
          {CONTACT.email}
        </a>{" "}
        albo na Instagramie{" "}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          @{SOCIAL_HANDLE}
        </a>
        . Szczegóły znajdziesz na stronach{" "}
        <Link href="/zwroty" className={linkClass}>
          Zwroty i reklamacje
        </Link>{" "}
        oraz{" "}
        <Link href="/regulamin" className={linkClass}>
          Regulamin
        </Link>
        .
      </div>
    </section>
  );
}
