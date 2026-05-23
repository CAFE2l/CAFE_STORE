'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-[55]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-up flex-col border-l border-white/[0.08] bg-[#111]/95 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <span className="flex items-center gap-2 text-lg font-bold text-white">
                <ShoppingBag className="h-5 w-5 text-[#FF7A00]" />
                Seu Carrinho
              </span>
              <button type="button" className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:text-white" onClick={onClose} aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-4 h-12 w-12 text-zinc-700" />
                  <p className="text-sm font-medium text-zinc-400">Carrinho vazio</p>
                  <p className="mt-1 text-xs text-zinc-600">Adicione produtos para continuar</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                      <Link href={`/products/${item.slug}`} className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <Link href={`/products/${item.slug}`} className="truncate text-sm font-medium text-white hover:text-[#FF7A00] transition-colors">
                          {item.name}
                        </Link>
                        {item.variants && item.variants.length > 0 ? (
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {item.variants.map((v) => `${v.name}: ${v.value}`).join(' / ')}
                          </p>
                        ) : null}
                        <p className="mt-0.5 text-sm font-bold text-[#FF7A00]">
                          {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center rounded-lg border border-zinc-700">
                            <button
                              type="button"
                              className="grid size-7 place-items-center text-zinc-500 transition hover:text-white"
                              onClick={() => { if (item.quantity <= 1) removeItem(item.id); else updateQty(item.id, item.quantity - 1); }}
                            >
                              {item.quantity <= 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                            </button>
                            <span className="min-w-[24px] text-center text-xs font-medium text-white">{item.quantity}</span>
                            <button
                              type="button"
                              className="grid size-7 place-items-center text-zinc-500 transition hover:text-white"
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button type="button" className="text-zinc-600 transition hover:text-red-400" onClick={() => removeItem(item.id)} aria-label="Remover">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t border-white/[0.06] px-6 py-5">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-bold text-white">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <p className="text-xs text-zinc-600">Frete calculado no checkout</p>
                <Link
                  href="/checkout"
                  className={cn(
                    'mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all duration-200',
                    'bg-[#FF7A00] shadow-[0_0_20px_rgba(255,122,0,0.3)] hover:shadow-[0_0_40px_rgba(255,122,0,0.5)]',
                  )}
                  onClick={onClose}
                >
                  Finalizar Compra
                </Link>
                <button type="button" className="mt-2 w-full py-2 text-center text-xs font-medium text-zinc-500 transition hover:text-zinc-300" onClick={onClose}>
                  Continuar Comprando
                </button>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </>
  );
}
