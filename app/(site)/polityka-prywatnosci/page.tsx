import type { Metadata } from "next";

export const metadata: Metadata = { title: "Polityka prywatności" };

const SECTIONS = [
  {
    title: "1. Administrator danych",
    body: [
      "Administratorem danych osobowych zbieranych za pośrednictwem sklepu tresetmob.vercel.app jest [Nazwa firmy], NIP: [uzupełnij], z siedzibą pod adresem [adres siedziby]. Kontakt w sprawach ochrony danych: kontakt@tresetmob.pl.",
    ],
  },
  {
    title: "2. Jakie dane zbieramy",
    body: [
      "Dane podawane przy składaniu zamówienia: imię i nazwisko, adres e-mail, numer telefonu, adres dostawy (lub wybrany Paczkomat InPost).",
      "Dane konta: adres e-mail powiązany z logowaniem przez Google.",
      "Dane techniczne: adres IP, informacje o urządzeniu i przeglądarce, zbierane automatycznie w celu prawidłowego działania Sklepu.",
    ],
  },
  {
    title: "3. Cel i podstawa przetwarzania",
    body: [
      "Dane przetwarzane są w celu realizacji zamówień i umowy sprzedaży (art. 6 ust. 1 lit. b RODO), obsługi konta i historii zamówień (art. 6 ust. 1 lit. b RODO), wypełnienia obowiązków prawnych, w tym podatkowych (art. 6 ust. 1 lit. c RODO), oraz kontaktu w sprawach reklamacji i zwrotów (art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes administratora).",
    ],
  },
  {
    title: "4. Odbiorcy danych",
    body: [
      "Dane mogą być udostępniane podmiotom obsługującym infrastrukturę i płatności Sklepu: dostawcy hostingu (Vercel), bazy danych (Neon), operatorowi płatności (Przelewy24), firmom kurierskim i InPost w celu realizacji dostawy oraz Google w zakresie logowania do konta.",
      "Dane nie są przekazywane poza Europejski Obszar Gospodarczy poza przypadkami wynikającymi z lokalizacji ww. dostawców usług, którzy zapewniają zgodność z RODO.",
    ],
  },
  {
    title: "5. Okres przechowywania",
    body: [
      "Dane związane z zamówieniami przechowywane są przez okres wymagany przepisami prawa podatkowego i rachunkowego.",
      "Dane konta przechowywane są do momentu jego usunięcia przez Klienta lub zgłoszenia żądania usunięcia danych.",
    ],
  },
  {
    title: "6. Prawa Klienta",
    body: [
      "Klientowi przysługuje prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz wniesienia sprzeciwu wobec przetwarzania.",
      "Klientowi przysługuje również prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych, jeśli uzna, że przetwarzanie jego danych narusza przepisy RODO.",
      "W celu realizacji powyższych praw prosimy o kontakt na adres kontakt@tresetmob.pl.",
    ],
  },
  {
    title: "7. Pliki cookies",
    body: [
      "Sklep wykorzystuje pliki cookies niezbędne do jego prawidłowego działania, m.in. do utrzymania sesji logowania oraz zawartości koszyka.",
      "Przeglądarkę można skonfigurować tak, aby blokowała pliki cookies — może to jednak wpłynąć na działanie niektórych funkcji Sklepu, np. koszyka.",
    ],
  },
];

export default function Polityka() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-12 bg-white px-6 py-16 text-black sm:px-12 lg:px-0 lg:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.3em] text-black/40">
          INFORMACJE
        </span>
        <h1 className="font-bebas text-5xl uppercase tracking-tight">
          Polityka prywatności
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
