'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Flame } from 'lucide-react';

type MobileNavProps = {
  navItems: { href: string; label: string }[];
};

export function MobileNav({ navItems }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="grid size-10 place-items-center rounded-button text-text-secondary transition hover:bg-white/10 hover:text-text-primary md:hidden"
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 animate-slide-up bg-cafe-dark-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2 font-display text-lg font-bold">
                <Flame className="h-5 w-5 text-cafe-orange-500" />
                <span className="text-gradient-fire">CAFÉ Store</span>
              </span>
              <button
                type="button"
                className="grid size-8 place-items-center rounded-button text-text-muted transition hover:text-text-primary"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-button px-4 py-3 text-sm font-medium text-text-secondary transition hover:bg-white/5 hover:text-text-primary"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
