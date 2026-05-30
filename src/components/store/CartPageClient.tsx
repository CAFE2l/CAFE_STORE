'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Check, CreditCard, LogIn, Minus, Plus, ShieldCheck, Sparkles, Trash2, UserX, Zap } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCartStore } from '@/store/cart';
import type { CartItem } from '@/types';
import { cn } from '@/lib/utils';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const taxRate = 0;

const recommendations = [
  {
    name: 'Caneca Preta Cafe Store',
    href: '/products/caneca-preta-cafe-store',
    image: '/images/produtos/caneca/preta/banner.png',
    price: 7.9,
    label: 'Apoio simbolico',
  },
  {
    name: 'Chaveiro Mascote Cafe Store',
    href: '/products/chaveiro-mascote-cafe-store',
    image: '/images/produtos/chaveiro/design.png',
    price: 4.9,
    label: 'Doacao rapida',
  },
  {
    name: 'Moletom Limited Edition Cafe Store',
    href: '/products/moletom-limited-edition-cafe-store',
    image: '/images/produtos/moletons/banner.png',
    price: 19.9,
    label: 'Apoio maior',
  },
];

const cardMotion = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

function getStockWarning(item: CartItem) {
  if (!item.stock || item.stock > 3) return null;
  return item.stock === 1 ? 'so 1 resta!' : `so ${item.stock} restam!`;
}

function QuantitySelector({
  max,
  onChange,
  value,
}: {
  max?: number;
  onChange: (value: number) => void;
  value: number;
}) {
  const canDecrease = value > 1;
  const canIncrease = !max || value < max;

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 transition-all duration-150 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
        disabled={!canDecrease}
        onClick={() => onChange(value - 1)}
        aria-label="Diminuir quantidade"
      >
        <Minus className="size-3.5" />
      </motion.button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-white">{value}</span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 transition-all duration-150 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
        aria-label="Aumentar quantidade"
      >
        <Plus className="size-3.5" />
      </motion.button>
    </div>
  );
}

export function CartPageClient() {
  const { items, removeItem, total, updateQty } = useCartStore();
  const [confirmed, setConfirmed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const taxes = total * taxRate;
  const finalTotal = Math.max(0, total + taxes);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_360px] lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Seu carrinho esta vazio"
        subtitle="Explore os apoios simbolicos da CAFÉ STORE para contribuir com o projeto."
        action={{ href: '/products', label: 'Ver apoios' }}
      />
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_360px] lg:grid-cols-[minmax(0,1fr)_400px]">
      <section className="grid min-w-0 gap-6">
        {items.length > 0 ? (
          <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.08 }} className="grid gap-4">
            <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const stockWarning = getStockWarning(item);
              const lineTotal = item.price * item.quantity;

              return (
                <motion.article
                  key={item.id}
                  variants={cardMotion}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  className="relative grid gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 pb-16 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-[10px] transition-colors duration-200 hover:border-orange-500/30 sm:grid-cols-[96px_minmax(0,1fr)] xl:grid-cols-[96px_minmax(0,1fr)_160px]"
                >
                  <Link href={`/products/${item.slug}`} className="relative size-24 min-h-20 min-w-20 overflow-hidden rounded-xl bg-zinc-900 sm:size-24">
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover transition duration-300 hover:scale-105" />
                  </Link>

                  <div className="grid min-w-0 content-start gap-3 pr-10">
                    <div className="flex flex-wrap gap-2">
                      {index === 0 ? (
                        <span className="rounded-full bg-orange-500 px-2.5 py-[3px] text-[11px] font-semibold leading-none text-white">
                          Mais vendido
                        </span>
                      ) : null}
                      {stockWarning ? (
                        <span className="rounded-full bg-red-500/15 px-2.5 py-[3px] text-[11px] font-semibold leading-none text-red-300">
                          {stockWarning}
                        </span>
                      ) : null}
                    </div>

                    <Link href={`/products/${item.slug}`} className="text-base font-semibold text-white transition hover:text-orange-400">
                      {item.name}
                    </Link>

                    {item.variants?.length ? (
                      <p className="text-[0.8rem] text-white/50">
                        {item.variants.map((variant) => `${variant.name}: ${variant.value}`).join(' / ')}
                      </p>
                    ) : null}

                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 xl:flex-col xl:items-end">
                    <div className="text-left xl:text-right">
                      <p className="text-xs text-white/45">Unitário</p>
                      <p className="text-sm font-medium text-white/75">
                        {currencyFormatter.format(item.price)} × {item.quantity}
                      </p>
                      <p className="mt-2 text-xs text-white/45">Total</p>
                      <p className="text-lg font-bold text-orange-500">= {currencyFormatter.format(lineTotal)}</p>
                    </div>
                    <QuantitySelector
                      value={item.quantity}
                      max={item.stock}
                      onChange={(quantity) => updateQty(item.id, quantity)}
                    />
                  </div>

                  <button
                    type="button"
                    className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-xs text-white/30 transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="size-3.5" />
                    Remover
                  </button>
                </motion.article>
              );
            })}
            </AnimatePresence>
          </motion.div>
        ) : null}

        <section className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5 shadow-[0_0_28px_rgba(249,115,22,0.06)]">
          <h2 className="font-display text-xl font-semibold text-white">Apoio simbolico, sem entrega fisica</h2>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Estes itens usam imagens ilustrativas da marca, mas nao sao produtos reais para envio. Ao continuar,
            voce esta fazendo uma doacao de apoio ao projeto CAFÉ STORE.
          </p>
        </section>

        <section className="grid gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">Outras formas de apoiar</h2>
            <p className="mt-1 text-sm text-white/50">Valores simbolicos para contribuir com o projeto.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recommendations.map((product, index) => (
              <motion.div
                key={product.href}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Link href={product.href} className="grid h-full gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-[10px] transition hover:border-orange-500/30">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-900">
                    <Image src={product.image} alt={product.name} fill sizes="180px" className="object-cover" />
                  </div>
                  <span className="w-fit rounded-full bg-orange-500 px-2.5 py-[3px] text-[11px] font-semibold text-white">{product.label}</span>
                  <p className="text-sm font-semibold text-white">{product.name}</p>
                  <p className="text-sm font-bold text-orange-400">{currencyFormatter.format(product.price)}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </section>

      <aside className="h-fit rounded-[20px] border border-orange-500/20 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(249,115,22,0.06)] backdrop-blur-[20px] md:sticky md:top-28">
        <h2 className="text-[1.2rem] font-bold text-white">Resumo do pedido</h2>
        <div className="mt-5 grid gap-4">
          <dl className="grid text-sm">
            <div className="flex justify-between gap-4 border-b border-white/[0.06] py-3 text-white/60">
              <dt>Subtotal</dt>
              <dd>{currencyFormatter.format(total)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.06] py-3 text-white/60">
              <dt>Entrega</dt>
              <dd>Nao se aplica</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.06] py-3 text-white/60">
              <dt>Taxas</dt>
              <dd>{taxes > 0 ? currencyFormatter.format(taxes) : 'Inclusas'}</dd>
            </div>
            <div className="mt-2 flex justify-between gap-4 border-t border-white/15 pt-4 text-lg font-bold text-white">
              <dt>Total</dt>
              <dd className="text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.55)]">{currencyFormatter.format(finalTotal)}</dd>
            </div>
          </dl>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-500/15 bg-orange-500/10 px-3 py-2 text-sm">
            <span className="text-white/55">Parcelamento</span>
            <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-400">
              10x de {currencyFormatter.format(finalTotal / 10)}
            </span>
          </div>

          <label className="group flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-white/60 transition hover:border-orange-500/35">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-orange-500/60 text-transparent transition peer-checked:bg-orange-500 peer-checked:text-white">
              <Check className={cn('size-3 transition', confirmed ? 'scale-100 opacity-100' : 'scale-75 opacity-0')} />
            </span>
            <span>
              Confirmo que entendo: isto e uma doacao simbolica. Nao ha envio, frete ou produto fisico garantido.
            </span>
          </label>

          <Link
            href={confirmed ? '/checkout' : '#'}
            aria-disabled={!confirmed}
            className={cn(
              'mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-sm font-bold tracking-[0.02em] text-white transition-all duration-300',
              'shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_6px_32px_rgba(249,115,22,0.6)] hover:scale-[1.01]',
              !confirmed && 'pointer-events-none opacity-55',
            )}
          >
            <Zap className="size-4" />
            Finalizar apoio
          </Link>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <Link href="/checkout" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-orange-500/30 px-3 text-sm font-semibold text-orange-300 transition hover:border-orange-500 hover:bg-orange-500/5">
              <UserX className="size-4" />
              Convidado
            </Link>
            <span className="text-xs text-white/35">ou</span>
            <Link href="/login?callbackUrl=/checkout" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500/15 px-3 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/25">
              <LogIn className="size-4" />
              Login
            </Link>
          </div>

          <div className="mt-3 grid gap-2 border-t border-white/[0.06] pt-4 text-xs leading-5 text-white/45">
            <p className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-orange-400" /> Pagamento seguro • SSL • Antifraude</p>
            <p className="flex items-center gap-2"><Sparkles className="size-3.5 text-orange-400" /> Doacao simbolica ao projeto</p>
            <p className="flex items-center gap-2">
              <Image src="/images/icons/pix.png" alt="Pix" width={14} height={14} className="size-3.5 object-contain" />
              <Image src="/images/icons/Mercadopago.png" alt="Mercado Pago" width={14} height={14} className="size-3.5 object-contain" />
              <Image src="/images/icons/PayPal.png" alt="PayPal" width={14} height={14} className="size-3.5 object-contain" />
              Pix • Cartão • Mercado Pago • PayPal
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
