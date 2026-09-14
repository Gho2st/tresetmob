"use client";

import { useState } from "react";
import Image from "next/image";
import type { SizeChartData } from "@/lib/size-charts";
import SizeChartTable from "@/components/product/SizeChartTable";
import { DEFAULT_SIZE_CHART_ILLUSTRATION } from "@/lib/size-chart-defaults";
import { uploadProductImage } from "./actions";

type SizeChartFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  chart?: SizeChartData;
};

type Column = { id: string; label: string };
type Row = { id: string; label: string; description: string; values: string[] };

// Punkt startowy dla nowej tabeli — typowa koszulka, admin wpisuje tylko liczby.
const DEFAULT_SIZES = ["S", "M", "L", "XL"];
const DEFAULT_ROWS = [
  { label: "A", description: "Długość" },
  { label: "B", description: "Szerokość" },
];

function nextRowLabel(rows: Row[]) {
  for (let code = 65; code <= 90; code++) {
    const letter = String.fromCharCode(code);
    if (!rows.some((r) => r.label === letter)) return letter;
  }
  return "";
}

const cellInput =
  "border border-black/20 px-2 py-2 text-sm focus:border-black focus:outline-none";
const fieldLabel = "text-xs tracking-widest text-black/40 uppercase";
const secondaryButton =
  "border border-black/30 px-4 py-2 text-xs tracking-widest uppercase transition-colors hover:border-black hover:bg-black hover:text-white";

export default function SizeChartForm({ action, chart }: SizeChartFormProps) {
  const [name, setName] = useState(chart?.name ?? "");
  const [note, setNote] = useState(chart?.note ?? "");
  const [columns, setColumns] = useState<Column[]>(() =>
    (chart?.sizes ?? DEFAULT_SIZES).map((label, i) => ({ id: `col-${i}`, label })),
  );
  const [rows, setRows] = useState<Row[]>(() =>
    chart
      ? chart.rows.map((row, i) => ({ id: `row-${i}`, ...row }))
      : DEFAULT_ROWS.map((row, i) => ({
          id: `row-${i}`,
          ...row,
          values: DEFAULT_SIZES.map(() => ""),
        })),
  );
  const [newSize, setNewSize] = useState("");
  const [illustration, setIllustration] = useState(chart?.illustration ?? null);
  const [pending, setPending] = useState<{ file: File; previewUrl: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSize = () => {
    const label = newSize.trim();
    if (!label || columns.some((c) => c.label === label)) return;
    setColumns((prev) => [...prev, { id: crypto.randomUUID(), label }]);
    setRows((prev) => prev.map((r) => ({ ...r, values: [...r.values, ""] })));
    setNewSize("");
  };

  const renameSize = (index: number, label: string) => {
    setColumns((prev) => prev.map((c, i) => (i === index ? { ...c, label } : c)));
  };

  const removeSize = (index: number) => {
    setColumns((prev) => prev.filter((_, i) => i !== index));
    setRows((prev) =>
      prev.map((r) => ({ ...r, values: r.values.filter((_, i) => i !== index) })),
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: nextRowLabel(prev),
        description: "",
        values: columns.map(() => ""),
      },
    ]);
  };

  const updateRow = (id: string, patch: Partial<Pick<Row, "label" | "description">>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const updateCell = (rowId: string, index: number, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, values: r.values.map((v, i) => (i === index ? value : v)) }
          : r,
      ),
    );
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleIllustration = (file: File | null) => {
    setPending((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return file ? { file, previewUrl: URL.createObjectURL(file) } : null;
    });
  };

  const resetIllustration = () => {
    handleIllustration(null);
    setIllustration(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (columns.every((c) => !c.label.trim())) {
      setError("Dodaj co najmniej jeden rozmiar.");
      return;
    }
    if (rows.every((r) => !r.label.trim())) {
      setError("Dodaj co najmniej jeden wymiar.");
      return;
    }

    setSaving(true);

    let illustrationUrl = illustration;
    if (pending) {
      try {
        const body = new FormData();
        body.set("file", pending.file);
        illustrationUrl = (await uploadProductImage(body)).url;
      } catch {
        setError("Nie udało się wgrać rysunku. Spróbuj zapisać ponownie.");
        setSaving(false);
        return;
      }
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("note", note);
    formData.set("illustration", illustrationUrl ?? "");
    formData.set(
      "table",
      JSON.stringify({
        sizes: columns.map((c) => c.label),
        rows: rows.map(({ label, description, values }) => ({
          label,
          description,
          values,
        })),
      }),
    );

    // Od tego miejsca nie łapiemy błędów — akcje kończą się redirectem,
    // który celowo musi przelecieć dalej, nie zostać złapany.
    await action(formData);
  };

  const hasCustomIllustration = Boolean(pending ?? illustration);

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-10">
      <div className="flex max-w-xl flex-col gap-2">
        <label className={fieldLabel}>Nazwa tabeli</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="np. Koszulka oversize"
          className="border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <div className="flex max-w-xl flex-col gap-3">
        <label className={fieldLabel}>Rysunek</label>
        <p className="text-xs text-black/40">
          Domyślnie pokazuje się rysunek koszulki. Dla innego kroju (np. bluzy)
          wgraj własny — z literami wymiarów, bez tabeli, bo ta generuje się sama.
        </p>
        <div className="relative h-56 w-full border border-black/10 bg-neutral-50">
          {pending ? (
            // eslint-disable-next-line @next/next/no-img-element -- lokalny podgląd z blob: URL, nie z Vercel Image Optimization
            <img
              src={pending.previewUrl}
              alt=""
              className="h-full w-full object-contain"
            />
          ) : illustration ? (
            <Image
              src={illustration}
              alt=""
              fill
              sizes="576px"
              className="object-contain"
            />
          ) : (
            <>
              <Image
                src={DEFAULT_SIZE_CHART_ILLUSTRATION}
                alt=""
                fill
                sizes="576px"
                className="object-contain"
              />
              <span className="absolute bottom-2 left-2 bg-white/80 px-2 py-0.5 text-[10px] tracking-widest text-black/50 uppercase">
                Domyślny
              </span>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              handleIllustration(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
            className="text-sm"
          />
          {hasCustomIllustration && (
            <button
              type="button"
              onClick={resetIllustration}
              className="text-xs tracking-widest text-black/50 uppercase underline underline-offset-4 hover:text-black"
            >
              Przywróć domyślny
            </button>
          )}
        </div>
        {pending && (
          <p className="text-xs text-black/40">
            Rysunek wgra się po kliknięciu „Zapisz tabelę”.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label className={fieldLabel}>Tabela (cm)</label>
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-black/10 px-2 py-2 text-left text-xs font-normal tracking-widest text-black/40 uppercase">
                  Wymiar
                </th>
                {columns.map((column, index) => (
                  <th key={column.id} className="border border-black/10 p-1.5">
                    <div className="flex items-center gap-1">
                      <input
                        value={column.label}
                        onChange={(e) => renameSize(index, e.target.value)}
                        aria-label={`Rozmiar ${index + 1}`}
                        className={`${cellInput} w-14 text-center font-semibold uppercase`}
                      />
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        aria-label={`Usuń rozmiar ${column.label}`}
                        className="px-1 text-black/30 hover:text-black"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="border border-black/10 p-1.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        value={row.label}
                        onChange={(e) => updateRow(row.id, { label: e.target.value })}
                        aria-label="Oznaczenie wymiaru"
                        className={`${cellInput} w-10 text-center font-semibold`}
                      />
                      <input
                        value={row.description}
                        onChange={(e) =>
                          updateRow(row.id, { description: e.target.value })
                        }
                        placeholder="np. Długość"
                        aria-label="Opis wymiaru"
                        className={`${cellInput} w-28`}
                      />
                    </div>
                  </td>
                  {row.values.map((value, index) => (
                    <td
                      key={columns[index]?.id ?? index}
                      className="border border-black/10 p-1.5"
                    >
                      <input
                        value={value}
                        onChange={(e) => updateCell(row.id, index, e.target.value)}
                        aria-label={`${row.label} — ${columns[index]?.label ?? ""}`}
                        className={`${cellInput} w-16 text-center`}
                      />
                    </td>
                  ))}
                  <td className="pl-2">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      aria-label={`Usuń wymiar ${row.label}`}
                      className="text-black/30 hover:text-black"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSize();
              }
            }}
            placeholder="np. XXL"
            className="border border-black/20 px-4 py-2 text-sm focus:border-black focus:outline-none"
          />
          <button type="button" onClick={addSize} className={secondaryButton}>
            Dodaj rozmiar
          </button>
          <button type="button" onClick={addRow} className={secondaryButton}>
            Dodaj wymiar
          </button>
        </div>
      </div>

      <div className="flex max-w-xl flex-col gap-2">
        <label className={fieldLabel}>Notatka pod tabelą (opcjonalnie)</label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Wymiary orientacyjne — mogą się nieznacznie różnić w zależności od modelu."
          className="border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <div className="flex max-w-xl flex-col gap-3">
        <label className={fieldLabel}>Podgląd tabeli</label>
        <SizeChartTable sizes={columns.map((c) => c.label)} rows={rows} />
      </div>

      {error && <p className="text-xs text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 w-fit bg-black px-7 py-3.5 text-sm tracking-widest text-white uppercase transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {saving ? "Zapisywanie..." : "Zapisz tabelę"}
      </button>
    </form>
  );
}
