import "server-only";
import { prisma } from "@/lib/prisma";

export type SizeChartRow = {
  label: string;
  description: string;
  values: string[];
};

export type SizeChartData = {
  id: string;
  name: string;
  illustration: string | null;
  sizes: string[];
  rows: SizeChartRow[];
  note: string | null;
};

// `rows` jest w bazie kolumną Json — tu pilnujemy kształtu, żeby reszta kodu
// zawsze dostawała poprawny obiekt, z liczbą wartości równą liczbie rozmiarów.
export function parseRows(raw: unknown, columns: number): SizeChartRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const values = Array.isArray(row.values) ? row.values.map(String) : [];
    return {
      label: String(row.label ?? ""),
      description: String(row.description ?? ""),
      values: Array.from({ length: columns }, (_, i) => values[i] ?? ""),
    };
  });
}

type SizeChartRecord = {
  id: string;
  name: string;
  illustration: string | null;
  sizes: string[];
  rows: unknown;
  note: string | null;
};

function toSizeChartData(chart: SizeChartRecord): SizeChartData {
  return {
    id: chart.id,
    name: chart.name,
    illustration: chart.illustration,
    sizes: chart.sizes,
    rows: parseRows(chart.rows, chart.sizes.length),
    note: chart.note,
  };
}

export async function getSizeCharts() {
  const charts = await prisma.sizeChart.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return charts.map((chart) => ({
    ...toSizeChartData(chart),
    productCount: chart._count.products,
  }));
}

export async function getSizeChart(id: string) {
  const chart = await prisma.sizeChart.findUnique({ where: { id } });
  return chart ? toSizeChartData(chart) : null;
}

export function getSizeChartOptions() {
  return prisma.sizeChart.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
