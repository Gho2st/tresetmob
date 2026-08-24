import Link from "next/link";
import { requireUser } from "@/lib/customer";
import { signOut } from "@/auth";

export default async function Konto() {
  const session = await requireUser();

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-10 bg-white px-6 py-16 text-black sm:px-12 lg:px-0 lg:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.3em] text-black/40">
          MOJE KONTO
        </span>
        <h1 className="font-bebas text-5xl uppercase tracking-tight">
          Witaj, {session.user?.name?.split(" ")[0] ?? "Kliencie"}
        </h1>
      </div>

      <div className="flex flex-col gap-1 border border-black/10 p-6 text-sm">
        <span className="text-black/40">Zalogowano jako</span>
        <span>{session.user?.email}</span>
      </div>

      <Link
        href="/konto/zamowienia"
        className="inline-flex w-fit items-center gap-3 border border-black/30 px-7 py-4 text-sm tracking-[0.15em] uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
      >
        Moje zamówienia
      </Link>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="text-sm tracking-[0.15em] text-black/50 underline underline-offset-4 hover:text-black"
        >
          Wyloguj się
        </button>
      </form>
    </section>
  );
}
