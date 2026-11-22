import { notFound } from "next/navigation";
import SizeChartForm from "@/components/admin/SizeChartForm";
import { getSizeChart } from "@/lib/size-charts";
import { updateSizeChart } from "../actions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

type Params = { params: Promise<{ id: string }> };

export default async function EdytujTabeleRozmiarow({ params }: Params) {
  const { id } = await params;
  const chart = await getSizeChart(id);

  if (!chart) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Edytuj tabelę rozmiarów"
        description={chart.name}
        back={{ href: "/admin/tabele-rozmiarow", label: "Tabele rozmiarów" }}
      />
      <SizeChartForm action={updateSizeChart.bind(null, chart.id)} chart={chart} />
    </div>
  );
}
