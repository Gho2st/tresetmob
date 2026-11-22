import SizeChartForm from "@/components/admin/SizeChartForm";
import { createSizeChart } from "../actions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function NowaTabelaRozmiarow() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Nowa tabela rozmiarów"
        back={{ href: "/admin/tabele-rozmiarow", label: "Tabele rozmiarów" }}
      />
      <SizeChartForm action={createSizeChart} />
    </div>
  );
}
