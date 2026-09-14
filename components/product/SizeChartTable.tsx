import type { SizeChartRow } from "@/lib/size-charts";

type SizeChartTableProps = {
  sizes: string[];
  rows: SizeChartRow[];
};

export default function SizeChartTable({ sizes, rows }: SizeChartTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-center text-sm">
        <thead>
          <tr>
            <th className="border border-black/20 px-3 py-2.5 text-xs font-semibold tracking-widest uppercase">
              cm
            </th>
            {sizes.map((size, i) => (
              <th
                key={`${size}-${i}`}
                className="border border-black/20 px-3 py-2.5 font-semibold uppercase"
              >
                {size}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={`${row.label}-${r}`}>
              <th
                scope="row"
                className="border border-black/20 px-3 py-2.5 font-semibold"
              >
                <span className="block">{row.label}</span>
                {row.description && (
                  <span className="block text-[10px] font-normal tracking-wide text-black/40 uppercase">
                    {row.description}
                  </span>
                )}
              </th>
              {row.values.map((value, c) => (
                <td
                  key={c}
                  className="border border-black/20 px-3 py-2.5 tabular-nums"
                >
                  {value || "–"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
