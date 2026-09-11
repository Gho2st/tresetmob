import type { Metadata } from "next";

export const metadata: Metadata = { title: "Regulamin" };

const SECTIONS = [
  {
    title: "1. Postanowienia ogólne",
    body: [
      "Sklep internetowy dostępny pod adresem tresetmob.vercel.app prowadzony jest przez [Nazwa firmy], NIP: [uzupełnij], REGON: [uzupełnij], z siedzibą pod adresem [adres siedziby] („Sprzedawca”).",
      "Niniejszy regulamin określa zasady korzystania ze sklepu, składania zamówień, płatności, dostawy oraz odstąpienia od umowy przez Klientów.",
      "Kontakt ze Sprzedawcą możliwy jest pod adresem e-mail kontakt@tresetmob.pl oraz przez wiadomość na Instagramie @tresetmob.",
    ],
  },
  {
    title: "2. Definicje",
    body: [
      "Sklep — serwis internetowy tresetmob.vercel.app, za pośrednictwem którego Klient może składać Zamówienia.",
      "Klient — osoba fizyczna, osoba prawna lub jednostka organizacyjna korzystająca ze Sklepu.",
      "Konsument — Klient będący osobą fizyczną, dokonujący zakupu niezwiązanego bezpośrednio z jego działalnością gospodarczą lub zawodową.",
      "Zamówienie — oświadczenie woli Klienta zmierzające do zawarcia umowy sprzedaży Towaru na odległość za pośrednictwem Sklepu.",
      "Towar — produkt dostępny w Sklepie, będący przedmiotem umowy sprzedaży.",
    ],
  },
  {
    title: "3. Składanie zamówień",
    body: [
      "Zamówienia można składać 24 godziny na dobę za pośrednictwem Sklepu, po skompletowaniu koszyka i podaniu danych niezbędnych do realizacji dostawy.",
      "Złożenie zamówienia nie wymaga założenia konta, ale rejestracja pozwala śledzić historię zamówień w zakładce „Moje konto”.",
      "Po złożeniu zamówienia Klient otrzymuje potwierdzenie z numerem zamówienia. Umowę sprzedaży uznaje się za zawartą z chwilą potwierdzenia przyjęcia zamówienia do realizacji.",
      "Warunkiem realizacji zamówienia jest podanie prawdziwych i kompletnych danych kontaktowych oraz adresu dostawy.",
    ],
  },
  {
    title: "4. Ceny i płatności",
    body: [
      "Wszystkie ceny podane w Sklepie są cenami brutto, wyrażonymi w złotych polskich (zł) i zawierają podatek VAT.",
      "Płatność za zamówienie realizowana jest online za pośrednictwem systemu Przelewy24.",
      "Sklep zastrzega sobie prawo do prowadzenia akcji promocyjnych i wprowadzania kodów rabatowych na zasadach określonych każdorazowo w opisie promocji.",
    ],
  },
  {
    title: "5. Dostawa",
    body: [
      "Zamówienia dostarczane są za pośrednictwem firmy kurierskiej lub do wybranego Paczkomatu InPost, na terenie Polski.",
      "Koszt dostawy pokrywa Sprzedawca — dostawa jest bezpłatna dla wszystkich zamówień.",
      "Czas realizacji zamówienia wynosi zwykle 1–3 dni robocze od zaksięgowania płatności, a czas dostawy zależy od wybranego przewoźnika.",
    ],
  },
  {
    title: "6. Odstąpienie od umowy i reklamacje",
    body: [
      "Konsument ma prawo odstąpić od umowy zawartej na odległość w terminie 14 dni bez podania przyczyny — szczegółowe zasady opisane są na stronie Zwroty.",
      "Towary objęte są rękojmią zgodnie z obowiązującymi przepisami prawa. Reklamacje można zgłaszać na adres e-mail kontakt@tresetmob.pl, podając numer zamówienia i opis niezgodności.",
      "Sprzedawca ustosunkuje się do reklamacji w terminie 14 dni od dnia jej otrzymania.",
    ],
  },
  {
    title: "7. Dane osobowe",
    body: [
      "Zasady przetwarzania danych osobowych Klientów opisane są w Polityce prywatności.",
    ],
  },
  {
    title: "8. Postanowienia końcowe",
    body: [
      "Sprzedawca zastrzega sobie prawo do wprowadzania zmian w regulaminie. Zamówienia złożone przed wejściem w życie zmian realizowane są na zasadach dotychczasowych.",
      "W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa polskiego, w tym Kodeksu cywilnego oraz ustawy o prawach konsumenta.",
    ],
  },
];

export default function Regulamin() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-12 bg-white px-6 py-16 text-black sm:px-12 lg:px-0 lg:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.3em] text-black/40">
          INFORMACJE
        </span>
        <h1 className="font-bebas text-5xl uppercase tracking-tight">
          Regulamin
        </h1>
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
