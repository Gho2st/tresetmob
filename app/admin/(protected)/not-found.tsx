import Link from "next/link";

// notFound() w panelu (np. usunięty produkt) — w stylu panelu, bez Nav/Footera sklepu.
export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-10">
      <h1 className="font-bebas text-3xl tracking-tight uppercase sm:text-4xl">
        Nie znaleziono
      </h1>
      <p className="text-sm text-black/50">
        Ten element nie istnieje albo został usunięty.
      </p>
      <Link
        href="/admin/produkty"
        className="border border-black/30 px-5 py-2.5 text-sm tracking-widest uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
      >
        Wróć do panelu
      </Link>
    </div>
  );
}
