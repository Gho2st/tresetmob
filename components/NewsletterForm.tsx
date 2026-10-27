"use client";

import { useActionState } from "react";
import {
  subscribeToNewsletter,
  type SubscribeState,
} from "@/app/(site)/newsletter/actions";

export default function NewsletterForm() {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(
    subscribeToNewsletter,
    { status: "idle" },
  );

  if (state.status === "ok") {
    return (
      <p role="status" className="max-w-xs text-sm leading-relaxed text-white/70">
        Sprawdź skrzynkę — wysłaliśmy link potwierdzający. Po kliknięciu
        dostaniesz kod -10%.
      </p>
    );
  }

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-3">
      <label htmlFor="newsletter-email" className="text-sm text-white/60">
        Nowości i dropy prosto na maila, a na start kod -10% na zakupy.
      </label>
      <div className="flex border border-white/25 focus-within:border-white">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Twój e-mail"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 bg-white px-5 text-xs tracking-[0.15em] text-black uppercase transition-colors hover:bg-white/80 disabled:bg-white/40"
        >
          {pending ? "…" : "Zapisz"}
        </button>
      </div>
      {/* pułapka na boty — schowana przed ludźmi i czytnikami ekranu */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />
      {state.status === "error" && (
        <p className="text-xs text-red-400">{state.message}</p>
      )}
      <p className="text-[0.68rem] leading-relaxed text-white/35">
        Wypiszesz się jednym kliknięciem w każdej wiadomości. Szczegóły w{" "}
        <a href="/polityka-prywatnosci" className="underline underline-offset-2 hover:text-white/60">
          polityce prywatności
        </a>
        .
      </p>
    </form>
  );
}
