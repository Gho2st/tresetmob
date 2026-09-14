import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT, RETURN_ADDRESS, SELLER, SITE_URL } from "@/lib/contact";
import { SHOP_POLICY } from "@/lib/shop-policy";

export const metadata: Metadata = { title: "Regulamin sklepu" };

const EFFECTIVE_DATE = "01.09.2025";

type Clause =
  | string
  | {
      text: string;
      items: string[];
      after?: string;
    };

type Section = { id: string; title: string; clauses: Clause[] };

const RETURN_ADDRESS_TEXT = `${RETURN_ADDRESS.street}, ${RETURN_ADDRESS.city}, tel. ${RETURN_ADDRESS.phone}`;

const SECTIONS: Section[] = [
  {
    id: "postanowienia-ogolne",
    title: "Postanowienia ogólne",
    clauses: [
      `Niniejszy regulamin (zwany dalej: „Regulaminem”) określa zasady zawierania i wykonywania umów o świadczenie usług drogą elektroniczną oraz umów sprzedaży w sklepie internetowym ${SITE_URL} oraz prawa i obowiązki stron tych umów.`,
      `Sklep internetowy treset.mob (zwany dalej: „Sklepem”), o którym mowa w pkt 1.1, dostępny jest dla wszystkich osób (dalej: „Użytkowników”) pod adresem ${SITE_URL}.`,
      `Właścicielem Sklepu (dalej: „Sprzedającym”) jest ${SELLER.name}, zamieszkały przy ${SELLER.address}.`,
      {
        text: "Dane kontaktowe Sprzedającego, umożliwiające Użytkownikom skuteczny kontakt, to:",
        items: [
          `adres e-mail: ${CONTACT.email}`,
          `telefon: ${CONTACT.phones.map((phone) => phone.label).join(" lub ")}`,
        ],
      },
      "Umowy o świadczenie usług drogą elektroniczną oraz umowy sprzedaży zawierane są ze Sprzedającym poprzez Sklep.",
      "Przedmiotem działalności Sprzedającego jest sprzedaż odzieży, akcesoriów oraz biżuterii (zwanych dalej: „Produktami”).",
      {
        text: "Sklep umożliwia:",
        items: [
          "pozyskiwanie informacji o Produktach, których kupno możliwe jest poprzez Sklep,",
          "składanie zamówień (dalej: „Zamówień”) przez Użytkowników (zwanych wówczas: „Kupującymi”),",
          "przeglądanie strony w wersji mobilnej przez Użytkowników korzystających z urządzeń mobilnych.",
        ],
      },
      "W Regulaminie pod pojęciem „Konsumenta” rozumie się, zgodnie z art. 22¹ Kodeksu cywilnego, Użytkownika będącego osobą fizyczną, dokonującego ze Sprzedającym czynności prawnej niezwiązanej bezpośrednio z jego działalnością gospodarczą lub zawodową.",
      "W celu złożenia Zamówienia konieczna jest akceptacja Regulaminu poprzez zaznaczenie odpowiedniego pola wyboru, znajdującego się w formularzu Zamówienia.",
      "Samo korzystanie ze Sklepu nie wymaga ponoszenia przez Użytkownika żadnych opłat.",
    ],
  },
  {
    id: "zamowienia",
    title: "Zamówienia",
    clauses: [
      "Zamówień w Sklepie mogą dokonywać osoby fizyczne, osoby prawne oraz jednostki organizacyjne nieposiadające osobowości prawnej, którym ustawa przyznaje zdolność prawną.",
      "Zamówienia w Sklepie można składać za pomocą formularza, bez konieczności rejestracji w Sklepie.",
      "Do złożenia Zamówienia konieczne jest zaakceptowanie Regulaminu.",
      {
        text: "Zamówienia muszą zawierać następujące dane:",
        items: [
          "imię i nazwisko Użytkownika składającego Zamówienie,",
          "adres dostawy lub wybrany Paczkomat InPost,",
          "adres e-mail,",
          "numer telefonu,",
          "nazwę, rozmiar i ilość zamówionych Produktów,",
          "wybrany sposób dostawy,",
          "wybrany sposób płatności.",
        ],
      },
      "Procedura składania Zamówienia każdorazowo kończona jest skutecznym kliknięciem przez Użytkownika przycisku „Zapłać i zamów”, co jest równoznaczne z potwierdzeniem przez Użytkownika, że formularz Zamówienia wypełniony został prawidłowo, a także że Użytkownik jest świadomy, iż realizacja Zamówienia pociąga za sobą obowiązek zapłaty.",
      "W przypadku nieprawidłowego wypełnienia formularza Zamówienia Kupujący może dokonać zmiany telefonicznie bądź e-mailem lub całkowicie anulować Zamówienie, pod warunkiem że nie zostało ono jeszcze wysłane.",
      "Po złożeniu Zamówienia na adres e-mail wskazany w formularzu niezwłocznie wysłana zostaje wiadomość zawierająca potwierdzenie złożenia Zamówienia przez Użytkownika.",
      "Umowa zostaje zawarta, gdy Sprzedający poinformuje o przystąpieniu do realizacji Zamówienia. Takie potwierdzenie zostanie przesłane drogą mailową.",
      "Sprzedający może wstrzymać przyjęcie Zamówienia w sytuacji wątpliwości co do prawdziwości bądź rzetelności danych wskazanych przez Kupującego w formularzu Zamówienia. W takim przypadku Sprzedający niezwłocznie skontaktuje się z Kupującym w celu wyjaśnienia tych wątpliwości.",
      "W przypadku braku dostępności Produktów uwzględnionych w Zamówieniu Sprzedający poinformuje Kupującego o niemożliwości realizacji Zamówienia i uzgodni z nim sposób zwrotu uiszczonej kwoty. Jeżeli niemożliwość realizacji Zamówienia dotyczy tylko czasowej niedostępności Produktów, Sprzedający poinformuje Kupującego o potencjalnym terminie realizacji Zamówienia telefonicznie bądź w wiadomości e-mail na adres wskazany w formularzu Zamówienia.",
      "Zamówienia realizowane są zgodnie z kolejnością ich złożenia.",
      "W przypadku braku stanu magazynowego Produktu Sprzedający zastrzega sobie prawo do zwrotu środków.",
    ],
  },
  {
    id: "ceny-i-platnosci",
    title: "Ceny i płatności",
    clauses: [
      "Ceny Produktów podawane są w polskich złotych (PLN) i są cenami brutto. Dostawa na terenie Polski jest bezpłatna. Całkowity koszt Zamówienia zostanie podany Kupującemu przed ostatecznym złożeniem Zamówienia.",
      {
        text: "Do wyboru Kupującego pozostają następujące sposoby zapłaty online:",
        items: [
          "przelew natychmiastowy (tzw. pay-by-link),",
          "BLIK,",
          "karty płatnicze Visa, Visa Electron, Maestro, MasterCard,",
          "Google Pay, Apple Pay.",
        ],
      },
      "Płatności online obsługiwane są przez zewnętrznego, licencjonowanego operatora płatności.",
      "Płatność za zamówione Produkty powinna być dokonana przez Użytkownika w ciągu 3 dni roboczych od zawarcia umowy.",
      "Sprzedający zastrzega sobie prawo do zmiany cen oraz wysokości kosztów dostawy, w szczególności w przypadku zmiany cenników usług świadczonych przez podmiot realizujący dostawy. Punkt ten nie dotyczy Zamówień będących w trakcie realizacji.",
    ],
  },
  {
    id: "dostawa",
    title: "Dostawa",
    clauses: [
      "Dostawa odbywa się wyłącznie na terenie Polski.",
      `Wysyłka Zamówień realizowana jest w ciągu ${SHOP_POLICY.dispatchWorkdays} dni roboczych od momentu otrzymania płatności.`,
      "Dostawa realizowana jest od poniedziałku do piątku, z wyjątkiem dni ustawowo wolnych od pracy.",
      "Zamówione przez Kupującego Produkty dostarczane są za pośrednictwem kuriera InPost lub do wybranego Paczkomatu InPost.",
      "Dostawa jest bezpłatna, niezależnie od wybranego sposobu dostawy i wartości Zamówienia.",
      "Czas doręczenia przesyłki przez przewoźnika wynosi zwykle 1–2 dni robocze od dnia wysyłki.",
    ],
  },
  {
    id: "wymiana",
    title: "Wymiana",
    clauses: [
      `Kupującemu przysługuje prawo do wymiany danego Produktu na inny rozmiar lub model w ciągu ${SHOP_POLICY.exchangeDays} dni od dnia otrzymania Zamówienia.`,
      "Koszt wysyłki Produktu do Sprzedającego ponosi Kupujący.",
      "Odsyłany Produkt nie może nosić żadnych śladów użytkowania.",
      "Do Produktu należy dołączyć paragon lub fakturę oraz formularz, który jest dostępny na stronie Zwroty i reklamacje.",
      `Produkt należy odesłać na adres: ${RETURN_ADDRESS_TEXT}.`,
      "Wymiana zostanie zrealizowana niezwłocznie po otrzymaniu przesyłki, nie później jednak niż 14 dni od daty otrzymania Produktu.",
      "W sytuacji niedostępności Produktu Sprzedający skontaktuje się z Kupującym w celu ustalenia przybliżonej daty realizacji wymiany.",
      "Paczki zwrotne nadane na niepoprawny numer telefonu nie zostaną odebrane.",
    ],
  },
  {
    id: "zwrot",
    title: "Zwrot",
    clauses: [
      `Konsument, zgodnie z art. 27 ustawy o prawach konsumenta z dnia 30 maja 2014 r. (Dz.U. z 2014 r. poz. 827), nabywający Produkt w Sklepie, ma możliwość odstąpienia od zawartej na odległość umowy w terminie ${SHOP_POLICY.returnDays} dni od dnia dostawy Produktu, bez ponoszenia kosztów innych niż bezpośrednie koszty zwrotu. Do zachowania tego terminu wystarczy wysłanie oświadczenia przed jego upływem. Oświadczenie (formularz zwrotu) można wysłać razem z Produktem na adres: ${RETURN_ADDRESS_TEXT}.`,
      "Do Produktu należy dołączyć paragon lub fakturę.",
      "Produkt nie może nosić śladów użytkowania.",
      "Konsument zwraca Produkty na własne ryzyko i koszt.",
      "Zwrotowi ani wymianie nie podlega (m.in. z powodów higienicznych) bielizna.",
      `W przypadku realizacji prawa odstąpienia Sprzedający zwróci Konsumentowi wszelkie dokonane płatności, w tym koszty dostawy Zamówienia, niezwłocznie, a nie później niż w terminie ${SHOP_POLICY.refundDays} dni od otrzymania Produktu wraz z formularzem zwrotu, przy użyciu takiego samego sposobu zapłaty, jakiego użył Konsument, chyba że Konsument wyraził zgodę na inny sposób zwrotu.`,
      "Prawo odstąpienia, o którym mowa w pkt 6.1, nie przysługuje Konsumentowi, zgodnie z art. 38 ustawy o prawach konsumenta, w odniesieniu do Produktów wykonanych na indywidualne Zamówienie.",
      "Paczki zwrotne nadane na niepoprawny numer telefonu nie zostaną odebrane.",
    ],
  },
  {
    id: "reklamacja",
    title: "Reklamacja",
    clauses: [
      "W stosunku do Konsumenta Sprzedający zobowiązuje się do dostarczenia Produktów bez wad.",
      {
        text: `Sprzedający nie udziela gwarancji na swoje Produkty. Zakupiony Produkt podlega reklamacji przez ${SHOP_POLICY.complaintYears} lata od dnia jego otrzymania, jeżeli zostanie stwierdzona:`,
        items: ["wada,", "niekompletność,", "niezgodność z opisem."],
        after:
          "Produkt może także zostać poddany reklamacji, jeżeli nie spełnia oczekiwań Kupującego na skutek wady powstałej podczas produkcji. Producent może w takiej sytuacji bezpłatnie naprawić szkodę, wymienić Produkt bądź zwrócić pieniądze – według uznania. Reklamacją nie są objęte Produkty, które zostały uszkodzone w wyniku nieprawidłowej konserwacji, zaniedbania, zwykłego zużycia, sprania, a także procesów naturalnych na skutek dłuższego użytkowania.",
      },
      `Sprzedający zastrzega sobie różnice wymiarowania w Produktach odzieżowych do ${SHOP_POLICY.sizeToleranceCm} cm w stosunku do wymiarów podanych na stronie.`,
      "W sytuacji, gdy Kupujący otrzyma Produkt wadliwy, może żądać usunięcia wady bądź wymiany rzeczy na wolną od wad.",
      {
        text: "Reklamacja nie wymaga zachowania specjalnej formy, natomiast powinna zawierać:",
        items: [
          "dane pozwalające zidentyfikować Użytkownika i Zamówienie (np. numer Zamówienia),",
          "oznaczenie Produktu, którego dotyczy reklamacja,",
          "uzasadnienie ze wskazaniem nieprawidłowości Produktu.",
        ],
      },
      `Reklamację należy zgłosić drogą e-mailową na adres ${CONTACT.email}. Jeżeli do rozpatrzenia reklamacji niezbędny jest Produkt, Sprzedający poprosi o jego odesłanie na adres: ${RETURN_ADDRESS_TEXT}.`,
      `W terminie ${SHOP_POLICY.complaintResponseDays} dni od złożenia reklamacji Sprzedający ustosunkuje się do niej i powiadomi Konsumenta o sposobie dalszego postępowania.`,
      "Sprzedający dołoży starań, by reklamacje były rozpatrywane bez zbędnej zwłoki.",
      "W trakcie trwania procesu reklamacyjnego Sprzedający może zwrócić się o dodatkowe wyjaśnienia, dokumenty lub weryfikację przebiegu zdarzenia podlegającego reklamacji.",
      "Po rozstrzygnięciu reklamacji Sprzedający poinformuje składającego reklamację o jej uwzględnieniu lub odmowie uwzględnienia (przy czym informacja o odmowie uwzględnienia reklamacji będzie zawierała uzasadnienie).",
    ],
  },
  {
    id: "postanowienia-koncowe",
    title: "Postanowienia końcowe",
    clauses: [
      "Sprzedający zastrzega sobie prawo do zmiany Regulaminu.",
      "Zamówienia złożone w trakcie obowiązywania poprzedniej wersji Regulaminu będą realizowane zgodnie z jego postanowieniami.",
      "Ewentualne spory powstałe pomiędzy Sprzedającym a Kupującym, który jest Konsumentem w rozumieniu art. 22¹ Kodeksu cywilnego, rozstrzygane będą przez sąd powszechny właściwy zgodnie z przepisami Kodeksu postępowania cywilnego.",
      "Ewentualne spory powstałe pomiędzy Sprzedającym a Kupującym, który nie jest Konsumentem w rozumieniu art. 22¹ Kodeksu cywilnego, rozstrzygane będą przez sąd powszechny właściwy ze względu na siedzibę Sklepu.",
      `Kupujący mogą uzyskać dostęp do niniejszego Regulaminu w każdym czasie za pośrednictwem linku zamieszczonego na stronie Sklepu ${SITE_URL}.`,
      `Niniejszy Regulamin obowiązuje od ${EFFECTIVE_DATE} roku.`,
    ],
  },
];

const ITEM_MARKERS = "ABCDEFGHIJ";

function ClauseBody({ clause }: { clause: Clause }) {
  if (typeof clause === "string") return <p>{clause}</p>;

  return (
    <div className="flex flex-col gap-2">
      <p>{clause.text}</p>
      <ul className="flex flex-col gap-1">
        {clause.items.map((item, i) => (
          <li key={item} className="flex gap-3">
            <span className="w-4 shrink-0 text-black/40">{ITEM_MARKERS[i]}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {clause.after && <p>{clause.after}</p>}
    </div>
  );
}

export default function Regulamin() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-12 bg-white px-6 py-16 text-black sm:px-12 lg:px-0 lg:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.3em] text-black/40">
          INFORMACJE
        </span>
        <h1 className="font-bebas text-5xl uppercase tracking-tight">
          Regulamin sklepu
        </h1>
        <p className="text-xs text-black/40">
          Obowiązuje od {EFFECTIVE_DATE}
        </p>
      </div>

      <nav aria-label="Spis treści" className="border-y border-black/10 py-6">
        <ol className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          {SECTIONS.map((section, i) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="flex gap-3 text-sm text-black/60 transition-colors hover:text-black"
              >
                <span className="w-5 text-black/30">{i + 1}.</span>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-12">
        {SECTIONS.map((section, sectionIndex) => (
          <div
            key={section.id}
            id={section.id}
            className="flex scroll-mt-24 flex-col gap-4"
          >
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              {sectionIndex + 1}. {section.title}
            </h2>
            <ol className="flex flex-col gap-3">
              {section.clauses.map((clause, clauseIndex) => (
                <li
                  key={clauseIndex}
                  className="flex gap-3 text-sm leading-relaxed text-black/70"
                >
                  <span className="w-8 shrink-0 text-black/30 tabular-nums">
                    {sectionIndex + 1}.{clauseIndex + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <ClauseBody clause={clause} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="border border-black/10 p-6 text-sm leading-relaxed text-black/70">
        Instrukcję zwrotu krok po kroku i formularz znajdziesz na stronie{" "}
        <Link
          href="/zwroty"
          className="text-black underline underline-offset-4 hover:text-black/60"
        >
          Zwroty i reklamacje
        </Link>
        .
      </div>
    </section>
  );
}
