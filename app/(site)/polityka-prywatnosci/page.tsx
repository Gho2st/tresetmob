import type { Metadata } from "next";
import { CONTACT, SELLER, SITE_URL } from "@/lib/contact";

export const metadata: Metadata = { title: "Polityka prywatności" };

const SECTIONS = [
  {
    title: "1. Administrator danych",
    body: [
      `Administratorem danych osobowych zbieranych za pośrednictwem Sklepu ${SITE_URL} jest ${SELLER.name}, ${SELLER.address} (dalej: „Administrator”), prowadzący Sklep na zasadach opisanych w Regulaminie.`,
      `Kontakt w sprawach ochrony danych: ${CONTACT.email}, tel. ${CONTACT.phones.map((phone) => phone.label).join(" lub ")}.`,
    ],
  },
  {
    title: "2. Jakie dane zbieramy",
    body: [
      "Dane podawane przy składaniu Zamówienia: imię i nazwisko, adres e-mail, numer telefonu, adres dostawy lub wybrany Paczkomat InPost, a przy zakupie na firmę także nazwa firmy, NIP i adres firmy potrzebne do wystawienia faktury VAT.",
      "Dane konta: adres e-mail, imię i nazwisko udostępnione przez Google lub Facebook przy logowaniu, rodzaj logowania oraz daty logowań.",
      "Dane subskrybenta newslettera: adres e-mail, źródło zapisu (formularz w stopce lub w kasie), daty zapisu, potwierdzenia i ewentualnego wypisania się, a także przydzielony kod rabatowy i informacja o jego wykorzystaniu.",
      "Dane podawane przy zwrocie, wymianie lub reklamacji: dane z formularza zwrotu, w tym numer rachunku bankowego, jeśli zostanie wskazany.",
      "Dane techniczne: adres IP, informacje o urządzeniu i przeglądarce, zbierane automatycznie w celu prawidłowego działania Sklepu.",
    ],
  },
  {
    title: "3. Cel i podstawa przetwarzania",
    body: [
      "Dane przetwarzane są w celu realizacji Zamówień i umowy sprzedaży, w tym wysyłki potwierdzeń i informacji o statusie Zamówienia (art. 6 ust. 1 lit. b RODO), obsługi konta i historii Zamówień (art. 6 ust. 1 lit. b RODO), wypełnienia obowiązków prawnych, w tym podatkowych i związanych z reklamacjami (art. 6 ust. 1 lit. c RODO), oraz obsługi zwrotów, wymian i kontaktu z Użytkownikiem (art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes Administratora).",
      "Dane subskrybentów newslettera przetwarzane są w celu wysyłki newslettera na podstawie zgody (art. 6 ust. 1 lit. a RODO), a po jej wycofaniu — w celu wykazania, że zgoda była udzielona i wycofana (art. 6 ust. 1 lit. f RODO).",
    ],
  },
  {
    title: "4. Newsletter",
    body: [
      "Zapis do newslettera jest dobrowolny i możliwy przez formularz w stopce Sklepu lub zaznaczenie osobnego pola przy składaniu Zamówienia. Zakup nie wymaga zapisu.",
      "Zapis wymaga potwierdzenia — na podany adres wysyłamy wiadomość z linkiem, a newsletter zaczynamy wysyłać dopiero po jego kliknięciu (tzw. double opt-in). Dopóki zapis nie zostanie potwierdzony, nie wysyłamy żadnych treści marketingowych.",
      "Po potwierdzeniu zapisu subskrybent otrzymuje jednorazowy kod rabatowy -10%. Kod przydzielany jest raz na adres e-mail.",
      "Newsletter zawiera informacje o nowościach, kolekcjach i promocjach Sklepu.",
      "Zgodę można wycofać w każdej chwili, bez podawania przyczyny — linkiem „Wypisz się” w każdej wiadomości lub pisząc na adres podany w pkt 1. Wycofanie zgody nie wpływa na zgodność z prawem przetwarzania, którego dokonano przed jej wycofaniem.",
    ],
  },
  {
    title: "5. Odbiorcy danych",
    body: [
      "Dane mogą być udostępniane podmiotom, które pomagają prowadzić Sklep: dostawcy hostingu (Vercel), bazy danych (Neon), operatorowi płatności online, firmie InPost w celu realizacji dostawy, dostawcy poczty e-mail w celu wysyłki wiadomości o Zamówieniu i newslettera oraz Google i Meta (Facebook) w zakresie logowania do konta.",
      "Dane nie są przekazywane poza Europejski Obszar Gospodarczy poza przypadkami wynikającymi z lokalizacji ww. dostawców usług, którzy zapewniają zgodność z RODO.",
    ],
  },
  {
    title: "6. Okres przechowywania",
    body: [
      "Dane związane z Zamówieniami przechowywane są przez okres wymagany przepisami prawa podatkowego i rachunkowego oraz przez okres, w którym możliwe jest złożenie reklamacji.",
      "Dane konta przechowywane są do momentu jego usunięcia lub zgłoszenia żądania usunięcia danych.",
      "Dane subskrybenta przechowywane są do czasu wycofania zgody. Po wypisaniu się zachowujemy adres e-mail wraz z datami zapisu i wypisu, aby móc wykazać przebieg zgody i nie wysyłać ponownie newslettera ani kodu rabatowego — do czasu zgłoszenia żądania usunięcia danych.",
    ],
  },
  {
    title: "7. Prawa Użytkownika",
    body: [
      "Użytkownikowi przysługuje prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz wniesienia sprzeciwu wobec przetwarzania.",
      "Użytkownikowi przysługuje również prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych, jeśli uzna, że przetwarzanie jego danych narusza przepisy RODO.",
      `W celu realizacji powyższych praw prosimy o kontakt na adres ${CONTACT.email}.`,
    ],
  },
  {
    title: "8. Pliki cookies",
    body: [
      "Sklep wykorzystuje pliki cookies i pamięć przeglądarki niezbędne do jego prawidłowego działania, m.in. do utrzymania sesji logowania oraz zawartości koszyka.",
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
        <h1 className="font-display text-5xl uppercase tracking-tight">
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
