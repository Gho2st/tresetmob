import Link from "next/link";
import { Search, ShoppingBag, User, Menu } from "lucide-react";

export default function Nav() {
  return (
    <nav className="w-full h-14 bg-white text-black border-b border-black/10 flex items-center justify-between px-4 md:px-8">
      {/* Lewa strona - Menu (mobile) + Logo */}
      <div className="flex items-center gap-4">
        <button className="md:hidden">
          <Menu size={22} strokeWidth={1.5} />
        </button>

        <Link href="/" className="font-bebas text-2xl tracking-wider">
          Tresetmob
        </Link>
      </div>

      {/* Prawa strona - ikonki */}
      <div className="flex items-center gap-5">
        <button aria-label="Search">
          <Search size={20} strokeWidth={1.5} />
        </button>

        <Link href="/logowanie" aria-label="login">
          <User size={20} strokeWidth={1.5} />
        </Link>

        <Link href="/koszyk" aria-label="koszyk" className="relative">
          <ShoppingBag size={20} strokeWidth={1.5} />
          {/* opcjonalnie badge z ilością */}
          <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            2
          </span>
        </Link>
      </div>
    </nav>
  );
}
