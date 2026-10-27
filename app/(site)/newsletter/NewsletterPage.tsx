import Link from "next/link";

/** Wspólna oprawa stron potwierdzenia i wypisu — jak pusty koszyk. */
export default function NewsletterPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
      <span className="text-xs tracking-[0.3em] text-black/40">NEWSLETTER</span>
      <h1 className="font-display text-5xl uppercase tracking-tight">{title}</h1>
      {children}
      <Link
        href="/sklep"
        className="mt-4 text-xs tracking-[0.2em] text-black/50 uppercase underline-offset-4 hover:text-black hover:underline"
      >
        Przejdź do sklepu
      </Link>
    </section>
  );
}

export const PRIMARY_BUTTON =
  "inline-flex w-fit items-center gap-3 bg-black px-7 py-4 text-sm tracking-[0.15em] text-white uppercase transition-colors hover:bg-neutral-800";
