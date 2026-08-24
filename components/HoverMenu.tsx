"use client";

import { useRef, useState } from "react";

type HoverMenuProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
};

export default function HoverMenu({ trigger, children }: HoverMenuProps) {
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpen(true);
  };

  const hide = () => {
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      {trigger}
      {open && (
        // Tylko desktop — na dotyku nie ma "najechania", więc na mobile
        // ikonka po prostu nawiguje bezpośrednio (link pod spodem).
        <div className="absolute top-full right-0 z-50 mt-3 hidden w-80 border border-black/10 bg-white shadow-lg md:block">
          {children}
        </div>
      )}
    </div>
  );
}
