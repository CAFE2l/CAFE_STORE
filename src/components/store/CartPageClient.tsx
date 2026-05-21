'use client';

import Image from 'next/image';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { PriceBlock } from '@/components/ui/PriceBlock';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCartStore } from '@/store/cart';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const shipping = 18.9;

export function CartPageClient() {
  const { clearCart, items, removeItem, total, updateQty } = useCartStore();
  const finalTotal = items.length > 0 ? total + shipping : 0;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Seu carrinho esta vazio"
        subtitle="Explore a vitrine e adicione cafes, kits ou acessorios para continuar."
        action={{ href: '/products', label: 'Ver produtos' }}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <section className="grid gap-4">
        {items.map((item) => (
          <article key={item.id} className="card grid gap-4 p-4 sm:grid-cols-[7rem_1fr_auto]">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-background-surface">
              <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" />
            </div>
            <div className="grid content-start gap-2">
              <Link href={`/products/${item.slug}`} className="font-semibold text-text-primary hover:text-accent-glow">
                {item.name}
              </Link>
              {item.variants?.length ? (
                <p className="text-xs text-text-muted">
                  {item.variants.map((variant) => `${variant.name}: ${variant.value}`).join(' / ')}
                </p>
              ) : null}
              <PriceBlock price={item.price} />
            </div>
            <div className="flex items-center justify-between gap-4 sm:grid sm:justify-items-end">
              <QuantityStepper
                value={item.quantity}
                min={1}
                max={item.stock}
                onChange={(quantity) => updateQty(item.id, quantity)}
              />
              <button
                type="button"
                className="text-sm text-status-error transition hover:brightness-125"
                onClick={() => removeItem(item.id)}
              >
                Remover
              </button>
            </div>
          </article>
        ))}
      </section>
      <aside className="glass sticky top-28 h-fit rounded-2xl p-5 shadow-warm">
        <h2 className="font-display text-2xl font-semibold text-text-primary">Resumo</h2>
        <dl className="mt-5 grid gap-3 text-sm">
          <div className="flex justify-between gap-4 text-text-secondary">
            <dt>Subtotal</dt>
            <dd>{currencyFormatter.format(total)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-text-secondary">
            <dt>Frete</dt>
            <dd>{currencyFormatter.format(shipping)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border-subtle pt-4 text-base font-semibold text-text-primary">
            <dt>Total</dt>
            <dd>{currencyFormatter.format(finalTotal)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="btn-primary mt-6 w-full">
          Finalizar compra
        </Link>
        <button type="button" className="btn-ghost mt-3 w-full" onClick={clearCart}>
          Limpar carrinho
        </button>
      </aside>
    </div>
  );
}
