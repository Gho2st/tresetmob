import { prisma } from "@/lib/prisma";
import CampaignForm from "./CampaignForm";

// Wysyłka idzie mail po mailu w ramach Server Action z tej strony, więc
// funkcja musi móc pożyć dłużej niż domyślne kilkanaście sekund.
export const maxDuration = 300;

const STATUS_LABELS: Record<string, string> = {
  aktywny: "Aktywny",
  oczekuje: "Czeka na potwierdzenie",
  wypisany: "Wypisany",
};

const date = (d: Date) =>
  d.toLocaleDateString("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default async function AdminNewsletter() {
  const [byStatus, codesUsed, subscribers, campaigns] = await Promise.all([
    prisma.newsletterSubscriber.groupBy({ by: ["status"], _count: true }),
    prisma.newsletterSubscriber.count({ where: { discountUsedAt: { not: null } } }),
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.newsletterCampaign.findMany({ orderBy: { sentAt: "desc" }, take: 10 }),
  ]);
  const count = (status: string) =>
    byStatus.find((row) => row.status === status)?._count ?? 0;
  const active = count("aktywny");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-tight uppercase sm:text-4xl">
          Newsletter
        </h1>
        <a
          href="/admin/newsletter/eksport"
          className="border border-black/20 px-4 py-2 text-xs tracking-widest uppercase transition-colors hover:border-black"
        >
          Eksport CSV
        </a>
      </div>

      <section className="grid grid-cols-2 border-t border-l border-black/10 lg:grid-cols-4">
        {[
          ["Aktywni", active],
          ["Czekają na potwierdzenie", count("oczekuje")],
          ["Wypisani", count("wypisany")],
          ["Wykorzystane kody -10%", codesUsed],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-2 border-r border-b border-black/10 p-4 sm:p-5"
          >
            <span className="text-[0.68rem] tracking-widest text-black/50 uppercase">
              {label}
            </span>
            <span className="font-display text-2xl tracking-tight tabular-nums sm:text-3xl">
              {value}
            </span>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs tracking-widest text-black/55 uppercase">
          Nowa wiadomość
        </h2>
        <CampaignForm activeCount={active} />
      </section>

      {campaigns.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xs tracking-widest text-black/55 uppercase">
            Wysłane
          </h2>
          <ul className="flex flex-col divide-y divide-black/10 border-y border-black/10">
            {campaigns.map((campaign) => (
              <li
                key={campaign.id}
                className="flex items-center justify-between gap-4 py-2.5 text-sm"
              >
                <span className="min-w-0 truncate">{campaign.subject}</span>
                <span className="shrink-0 text-xs text-black/45 tabular-nums">
                  {date(campaign.sentAt)} · {campaign.recipients} os.
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-xs tracking-widest text-black/55 uppercase">
          Zapisani {subscribers.length === 100 && "(ostatnie 100)"}
        </h2>
        {subscribers.length === 0 ? (
          <p className="border-y border-black/10 py-6 text-sm text-black/45">
            Nikt się jeszcze nie zapisał.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-black/10 border-y border-black/10">
            {subscribers.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
              >
                <span className="min-w-0 break-all">{s.email}</span>
                <span className="text-xs text-black/45">
                  {STATUS_LABELS[s.status] ?? s.status} · {s.source} ·{" "}
                  {date(s.createdAt)}
                  {s.discountUsedAt && " · kod wykorzystany"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
