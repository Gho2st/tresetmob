"use client";

import { useState, useTransition } from "react";
import { updateShopSettings } from "./actions";

type Props = {
  maintenance: boolean;
  maintenanceMessage: string | null;
  defaultMessage: string;
};

export default function SettingsForm({ maintenance, maintenanceMessage, defaultMessage }: Props) {
  const [enabled, setEnabled] = useState(maintenance);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await updateShopSettings(formData);
          setSaved(true);
        })
      }
      onChange={() => setSaved(false)}
      className="flex max-w-xl flex-col gap-6"
    >
      <label className="flex cursor-pointer items-start justify-between gap-6 border border-black/10 p-5">
        <span className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Tryb prac technicznych</span>
          <span className="text-xs leading-relaxed text-black/50">
            Na całej stronie pojawia się pasek z komunikatem, a kasa jest
            zablokowana. Ty jako admin możesz dalej składać zamówienia, żeby
            testować płatności.
          </span>
        </span>
        <input
          name="maintenance"
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-black/15 transition-colors peer-checked:bg-black peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
        />
      </label>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="maintenanceMessage"
          className="text-xs tracking-widest text-black/40 uppercase"
        >
          Komunikat dla klientów
        </label>
        <textarea
          id="maintenanceMessage"
          name="maintenanceMessage"
          rows={3}
          defaultValue={maintenanceMessage ?? ""}
          placeholder={defaultMessage}
          className="border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
        />
        <span className="text-xs text-black/40">
          Puste pole = domyślny komunikat widoczny powyżej jako podpowiedź.
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-black px-6 py-3 text-xs tracking-widest text-white uppercase transition-colors hover:bg-neutral-800 disabled:bg-neutral-300"
        >
          {pending ? "Zapisywanie…" : "Zapisz"}
        </button>
        {saved && !pending && <span className="text-xs text-black/50">Zapisano.</span>}
      </div>
    </form>
  );
}
