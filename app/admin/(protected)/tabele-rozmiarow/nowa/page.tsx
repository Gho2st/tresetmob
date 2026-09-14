import SizeChartForm from "@/components/admin/SizeChartForm";
import { createSizeChart } from "../actions";

export default function NowaTabelaRozmiarow() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-bebas text-4xl uppercase tracking-tight">
        Nowa tabela rozmiarów
      </h1>
      <SizeChartForm action={createSizeChart} />
    </div>
  );
}
