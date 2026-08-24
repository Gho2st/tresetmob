"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function AccountPreview() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return (
      <div className="flex flex-col gap-3 p-4">
        <p className="text-sm text-black/50">Nie jesteś zalogowany.</p>
        <Link
          href="/logowanie"
          className="border border-black/30 px-4 py-2 text-center text-xs tracking-widest uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
        >
          Zaloguj się
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-black/10 p-4">
        <p className="truncate text-sm font-semibold">{session.user?.name}</p>
        <p className="truncate text-xs text-black/40">{session.user?.email}</p>
      </div>
      <div className="flex flex-col p-2">
        <Link href="/konto" className="px-2 py-2 text-sm hover:bg-black/5">
          Moje konto
        </Link>
        <Link
          href="/konto/zamowienia"
          className="px-2 py-2 text-sm hover:bg-black/5"
        >
          Moje zamówienia
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-2 py-2 text-left text-sm text-black/50 hover:bg-black/5 hover:text-black"
        >
          Wyloguj się
        </button>
      </div>
    </div>
  );
}
