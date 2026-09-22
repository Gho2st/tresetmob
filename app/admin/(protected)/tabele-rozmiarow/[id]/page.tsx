import { notFound } from "next/navigation";
import SizeChartForm from "@/components/admin/SizeChartForm";
import { getSizeChart } from "@/lib/size-charts";
import { updateSizeChart } from "../actions";

type Params = { params: Promise<{ id: string }> };

export default async function EdytujTabeleRozmiarow({ params }: Params) {
  const { id } = await params;
  const chart = await getSizeChart(id);

  if (!chart) notFound();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-bebas text-3xl tracking-tight uppercase sm:text-4xl">
        Edytuj tabelę rozmiarów
      </h1>
      <SizeChartForm action={updateSizeChart.bind(null, chart.id)} chart={chart} />
    </div>
  );
}
