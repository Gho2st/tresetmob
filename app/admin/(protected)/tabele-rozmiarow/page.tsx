import Image from "next/image";
import Link from "next/link";
import { getSizeCharts } from "@/lib/size-charts";
import { DEFAULT_SIZE_CHART_ILLUSTRATION } from "@/lib/size-chart-defaults";
import { deleteSizeChart } from "./actions";

export default async function TabeleRozmiarow() {
  const charts = await getSizeCharts();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bebas text-4xl uppercase tracking-tight">
          Tabele rozmiarów
        </h1>
        <Link
          href="/admin/tabele-rozmiarow/nowa"
          className="border border-black/30 px-5 py-2.5 text-sm tracking-widest uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
        >
          + Dodaj tabelę
        </Link>
      </div>

      <p className="max-w-xl text-sm text-black/50">
        Tabelę przypisujesz produktom w ich formularzu. Zmiana tabeli od razu
        aktualizuje wszystkie przypisane produkty.
      </p>

      {charts.length === 0 ? (
        <p className="text-sm text-black/50">
          Brak tabel. Dodaj pierwszą przyciskiem powyżej.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/10 border-y border-black/10">
          {charts.map((chart) => (
            <li key={chart.id} className="flex items-center gap-5 py-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-black/10 bg-neutral-50">
                <Image
                  src={chart.illustration ?? DEFAULT_SIZE_CHART_ILLUSTRATION}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide">
                  {chart.name}
                </p>
                <p className="text-xs text-black/40">
                  {chart.sizes.join(" / ")} · wymiary: {chart.rows.length} ·
                  produkty: {chart.productCount}
                </p>
              </div>

              <Link
                href={`/admin/tabele-rozmiarow/${chart.id}`}
                className="text-xs tracking-widest uppercase underline underline-offset-4 hover:text-black/60"
              >
                Edytuj
              </Link>

              <form
                action={async () => {
                  "use server";
                  await deleteSizeChart(chart.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs tracking-widest text-red-700 uppercase underline underline-offset-4 hover:text-red-900"
                >
                  Usuń
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
