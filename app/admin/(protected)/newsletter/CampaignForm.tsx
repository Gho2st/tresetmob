"use client";

import { useState, useTransition } from "react";
import {
  sendNewsletterCampaign,
  sendTestCampaign,
  type CampaignResult,
} from "./actions";

const INPUT =
  "w-full border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none";
const BUTTON =
  "border px-5 py-3 text-xs tracking-widest uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export default function CampaignForm({ activeCount }: { activeCount: number }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: typeof sendTestCampaign) =>
    startTransition(async () => {
      setResult(null);
      const res = await action(subject, body);
      setResult(res);
      if (res.ok && action === sendNewsletterCampaign) {
        setSubject("");
        setBody("");
      }
    });

  return (
    <div className="flex flex-col gap-4">
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Temat"
        maxLength={150}
        className={INPUT}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={"Treść wiadomości.\n\nPusta linia zaczyna nowy akapit. Link do wypisania się dodajemy automatycznie."}
        rows={10}
        className={`${INPUT} resize-y leading-relaxed`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(sendTestCampaign)}
          className={`${BUTTON} border-black/30 hover:border-black`}
        >
          Wyślij test do mnie
        </button>
        <button
          type="button"
          disabled={pending || activeCount === 0}
          onClick={() => {
            if (
              window.confirm(
                `Wysłać „${subject || "(bez tematu)"}” do ${activeCount} osób? Tego nie da się cofnąć.`,
              )
            ) {
              run(sendNewsletterCampaign);
            }
          }}
          className={`${BUTTON} border-black bg-black text-white hover:bg-neutral-800`}
        >
          {pending ? "Wysyłanie…" : `Wyślij do ${activeCount} osób`}
        </button>
        {result && (
          <span
            role="status"
            className={`text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}
          >
            {result.message}
          </span>
        )}
      </div>
    </div>
  );
}
