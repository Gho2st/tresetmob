import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Zwroty" };

const SECTIONS = [
  {
    title: "Prawo odstąpienia od umowy",
    body: [
      "Jako Konsument masz prawo odstąpić od umowy zawartej na odległość w terminie 14 dni od dnia otrzymania przesyłki, bez podawania przyczyny i bez ponoszenia kosztów, z wyjątkiem kosztu odesłania towaru.",
      "Aby skorzystać z prawa odstąpienia, wystarczy poinformować nas o swojej decyzji jednoznacznym oświadczeniem — mailowo, na adres kontakt@tresetmob.pl, podając numer zamówienia.",
    ],
  },
  {
    title: "Jak zwrócić towar",
    body: [
      "Napisz do nas na kontakt@tresetmob.pl z numerem zamówienia i informacją, które produkty zwracasz.",
      "Odeślij towar na wskazany przez nas adres w terminie 14 dni od zgłoszenia chęci odstąpienia od umowy.",
      "Do przesyłki dołącz numer zamówienia — ułatwi to szybkie rozpoznanie zwrotu.",
    ],
  },
  {
    title: "Warunki zwrotu",
    body: [
      "Towar powinien być zwrócony w stanie niezmienionym — nieużywany, z oryginalnymi metkami, w miarę możliwości w oryginalnym opakowaniu.",
      "Możesz przymierzyć produkt tak, jak zrobiłbyś to w sklepie stacjonarnym — jeśli nosi ślady użytkowania wykraczające poza to, zwrot może zostać obniżony o utratę wartości towaru.",
    ],
  },
  {
    title: "Zwrot pieniędzy",
    body: [
      "Pieniądze zwracamy niezwłocznie, nie później niż w ciągu 14 dni od dnia otrzymania zwróconego towaru, tą samą metodą płatności, jakiej użyto przy zakupie.",
      "Koszt odesłania towaru do nas pokrywa Klient, chyba że zwrot wynika z wady towaru lub błędu po naszej stronie.",
    ],
  },
  {
    title: "Wymiana rozmiaru",
    body: [
      "Nie prowadzimy bezpośredniej wymiany rozmiaru — najszybszym rozwiązaniem jest zwrot zamówionego produktu i złożenie nowego zamówienia w prawidłowym rozmiarze.",
    ],
  },
  {
    title: "Reklamacje",
    body: [
      "Jeśli otrzymany towar jest wadliwy lub niezgodny z opisem, przysługuje Ci prawo do reklamacji na zasadach rękojmi określonych w Kodeksie cywilnym.",
      "Reklamacje przyjmujemy pod adresem kontakt@tresetmob.pl — opisz problem i dołącz zdjęcia, jeśli to możliwe. Odpowiadamy w terminie 14 dni.",
    ],
  },
];

export default function Zwroty() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-12 bg-white px-6 py-16 text-black sm:px-12 lg:px-0 lg:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.3em] text-black/40">
          OBSŁUGA
        </span>
        <h1 className="font-bebas text-5xl uppercase tracking-tight">
          Zwroty
        </h1>
      </div>

      <div className="border border-black/10 p-6 text-sm leading-relaxed text-black/70">
        Masz <span className="font-semibold text-black">14 dni</span> od
        otrzymania przesyłki na zwrot bez podania przyczyny. Pytania?{" "}
        <Link
          href="/centrum-pomocy"
          className="underline underline-offset-4 hover:text-black"
        >
          Zajrzyj do centrum pomocy
        </Link>
        .
      </div>

      <div className="flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              {section.title}
            </h2>
            {section.body.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-black/70">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
