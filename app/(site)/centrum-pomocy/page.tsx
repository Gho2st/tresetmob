import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata: Metadata = { title: "Centrum pomocy" };

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
        answer:
          "Jeśli zamówienie nie zostało jeszcze wysłane, napisz do nas jak najszybciej — postaramy się je zmienić lub anulować. Po wysyłce można skorzystać z prawa zwrotu w ciągu 14 dni.",
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
          "Dostawa jest bezpłatna — niezależnie od wybranej metody (kurier lub Paczkomat InPost) i wartości zamówienia.",
      },
      {
        question: "Ile trwa realizacja i dostawa zamówienia?",
        answer:
          "Zamówienia pakujemy zwykle w ciągu 1–3 dni roboczych od zaksięgowania płatności. Czas samej dostawy zależy od przewoźnika — standardowo to 1–2 dni robocze.",
      },
      {
        question: "Czy dostarczacie za granicę?",
        answer:
          "Obecnie realizujemy dostawy tylko na terenie Polski.",
      },
    ],
  },
  {
    title: "Płatności",
    items: [
      {
        question: "Jakie metody płatności są dostępne?",
        answer:
          "Płatności obsługiwane są przez Przelewy24 — możesz zapłacić szybkim przelewem, BLIK-iem lub kartą.",
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
        answer:
          "Masz 14 dni od otrzymania przesyłki na zwrot bez podania przyczyny. Pełne zasady i instrukcję krok po kroku znajdziesz na stronie Zwroty.",
      },
      {
        question: "Produkt jest wadliwy — co teraz?",
        answer:
          "Napisz do nas z numerem zamówienia i opisem (najlepiej ze zdjęciem) — rozpatrzymy reklamację w ciągu 14 dni.",
      },
    ],
  },
  {
    title: "Rozmiary",
    items: [
      {
        question: "Jak dobrać rozmiar?",
        answer:
          "Na każdej stronie produktu, obok wyboru rozmiaru, znajdziesz link „Tablica rozmiarów” z wymiarami w centymetrach dla poszczególnych rozmiarów.",
      },
      {
        question: "Rozmiar którego szukam jest niedostępny — co robić?",
        answer:
          "Wyprzedane rozmiary czasem wracają do sprzedaży. Napisz do nas na Instagramie @tresetmob, a damy znać, gdy dany produkt się doda.",
      },
    ],
  },
];

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
        Nie znalazłeś odpowiedzi?{" "}
        <a
          href="mailto:kontakt@tresetmob.pl"
          className="text-black underline underline-offset-4 hover:text-black/60"
        >
          kontakt@tresetmob.pl
        </a>{" "}
        albo napisz na Instagramie{" "}
        <a
          href="https://www.instagram.com/tresetmob/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline underline-offset-4 hover:text-black/60"
        >
          @tresetmob
        </a>
        . Więcej o zwrotach znajdziesz na stronie{" "}
        <Link
          href="/zwroty"
          className="text-black underline underline-offset-4 hover:text-black/60"
        >
          Zwroty
        </Link>
        .
      </div>
    </section>
  );
}
