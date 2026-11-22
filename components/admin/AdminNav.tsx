"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ImageIcon,
  LayoutDashboard,
  LogIn,
  Mail,
  Package,
  Ruler,
  Settings,
  ShoppingBag,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Podsumowanie", Icon: LayoutDashboard },
  { href: "/admin/zamowienia", label: "Zamówienia", Icon: ShoppingBag },
  { href: "/admin/produkty", label: "Produkty", Icon: Package },
  { href: "/admin/tabele-rozmiarow", label: "Tabele rozmiarów", Icon: Ruler },
  { href: "/admin/newsletter", label: "Newsletter", Icon: Mail },
  { href: "/admin/hero", label: "Hero", Icon: ImageIcon },
  { href: "/admin/logowanie", label: "Strona logowania", Icon: LogIn },
  { href: "/admin/ustawienia", label: "Ustawienia", Icon: Settings },
];

// "/admin" pasuje tylko dokładnie — inaczej podświetlałby się na każdej podstronie.
function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Panel admina"
      className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
    >
      {LINKS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-black text-white"
                : "text-black/60 hover:bg-black/5 hover:text-black"
            }`}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span className="whitespace-nowrap">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
