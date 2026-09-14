import Link from "next/link";

export default function NotFoundContent() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center gap-6 bg-white px-6 py-24 text-center text-black">
      <p
        aria-hidden="true"
        className="font-bebas text-[9rem] leading-none tracking-tight sm:text-[12rem]"
      >
        404
      </p>
      <h1 className="font-bebas text-4xl uppercase tracking-tight sm:text-5xl">
        Nie ma takiej strony
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-black/50">
        Strona mogła zostać usunięta albo zmienić adres. Sprawdź link albo wróć
        do sklepu.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/sklep"
          className="inline-flex items-center bg-black px-7 py-4 text-sm tracking-[0.15em] text-white uppercase transition-colors hover:bg-neutral-800"
        >
          Przejdź do sklepu
        </Link>
        <Link
          href="/"
          className="inline-flex items-center border border-black/30 px-7 py-4 text-sm tracking-[0.15em] uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
        >
          Strona główna
        </Link>
      </div>
    </section>
  );
}
