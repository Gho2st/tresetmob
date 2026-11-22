import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  // Podstrony (edycja, nowy wpis) dostają powrót do listy, z której przyszły.
  back?: { href: string; label: string };
  // Przyciski albo liczniki po prawej stronie tytułu.
  children?: React.ReactNode;
};

export default function AdminPageHeader({ title, description, back, children }: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-black/10 pb-6">
      {back && (
        <Link
          href={back.href}
          className="flex w-fit items-center gap-1 text-xs tracking-widest text-black/40 uppercase transition-colors hover:text-black"
        >
          <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl tracking-tight uppercase sm:text-4xl">
            {title}
          </h1>
          {description && <p className="text-sm text-black/50">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
