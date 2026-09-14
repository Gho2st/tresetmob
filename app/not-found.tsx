import SiteShell from "@/components/SiteShell";
import NotFoundContent from "@/components/NotFoundContent";

// Nieistniejące adresy — renderuje się tylko w głównym layoucie, więc sam dokłada Nav/Footer.
// notFound() wywołane w sklepie trafia do app/(site)/not-found.tsx (layout ma już Nav).
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
