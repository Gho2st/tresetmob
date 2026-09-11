"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = { question: string; answer: string };

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ul className="flex flex-col divide-y divide-black/10 border-y border-black/10">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <li key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-sm font-semibold tracking-wide uppercase">
                {item.question}
              </span>
              <ChevronDown
                size={18}
                strokeWidth={1.5}
                className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open && (
              <p className="pb-5 text-sm leading-relaxed text-black/70">
                {item.answer}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
