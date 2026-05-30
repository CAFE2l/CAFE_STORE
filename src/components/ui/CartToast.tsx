'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { useEffect } from 'react';

interface CartToastProps {
  item: { name: string; imageUrl: string; price: number } | null;
  onClose: () => void;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function CartToast({ item, onClose }: CartToastProps) {
  useEffect(() => {
    if (!item) return;
    const timeout = setTimeout(onClose, 3000);
    return () => clearTimeout(timeout);
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed right-4 top-24 z-[80] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-orange-500/25 bg-zinc-950/95 shadow-[0_22px_70px_rgba(0,0,0,0.55),0_0_34px_rgba(249,115,22,0.12)] backdrop-blur-xl"
        >
          <motion.div
            className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-300 to-green-400"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 3, ease: 'linear' }}
            style={{ transformOrigin: 'left' }}
          />

          <div className="flex gap-3 p-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
              <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
                <Check className="h-3.5 w-3.5" />
                Adicionado ao carrinho
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-white">{item.name}</p>
              <p className="mt-0.5 text-xs font-medium text-orange-300">{currencyFormatter.format(item.price)}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/35 transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-white/[0.06] p-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-white/10 text-sm font-semibold text-white/60 transition hover:bg-white/[0.05] hover:text-white"
            >
              Continuar
            </button>
            <Link
              href="/cart"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-orange-500 text-sm font-semibold text-white shadow-[0_0_22px_rgba(249,115,22,0.24)] transition hover:bg-orange-400"
            >
              Ver carrinho
            </Link>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
