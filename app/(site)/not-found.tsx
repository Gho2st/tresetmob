import NotFoundContent from "@/components/NotFoundContent";

// notFound() w trasach sklepu (np. nieistniejący produkt) — renderuje się wewnątrz
// layoutu (site), który ma już Nav/Footer, więc tu tylko treść.
export default function SiteNotFound() {
  return <NotFoundContent />;
}
