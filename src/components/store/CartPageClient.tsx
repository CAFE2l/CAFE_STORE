'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCartStore } from '@/store/cart';
import type { CartItem } from '@/types';

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

function getStockWarning(item: CartItem) {
  if (!item.stock || item.stock > 3) return null;
  return item.stock === 1 ? 'so 1 resta!' : `so ${item.stock} restam!`;
}

export function CartPageClient() {
  const { clearCart, items, removeItem, total, updateQty } = useCartStore();
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const taxes = total * taxRate;
  const finalTotal = Math.max(0, total + taxes);

  function handleSaveForLater(item: CartItem) {
    setSavedForLater((current) => {
      if (current.some((savedItem) => savedItem.id === item.id)) return current;
      return [...current, item];
    });
    removeItem(item.id);
  }

  function handleMoveBackToCart(item: CartItem) {
    useCartStore.getState().addItem(item);
    setSavedForLater((current) => current.filter((savedItem) => savedItem.id !== item.id));
  }

  if (items.length === 0 && savedForLater.length === 0) {
    return (
      <EmptyState
        title="Seu carrinho esta vazio"
        subtitle="Explore os apoios simbolicos da CAFÉ STORE para contribuir com o projeto."
        action={{ href: '/products', label: 'Ver apoios' }}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_25rem]">
      <section className="grid gap-6">
        {items.length > 0 ? (
          <div className="grid gap-4">
            {items.map((item, index) => {
              const stockWarning = getStockWarning(item);
              const lineTotal = item.price * item.quantity;

              return (
                  <article key={item.id} className="card grid gap-4 p-4 sm:grid-cols-[7rem_1fr] xl:grid-cols-[7rem_1fr_auto]">
                  <Link href={`/products/${item.slug}`} className="relative aspect-square overflow-hidden rounded-lg bg-cafe-dark-700">
                    <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover transition duration-300 hover:scale-105" />
                  </Link>
                  <div className="grid content-start gap-2">
                    <div className="flex flex-wrap gap-2">
                      {index === 0 ? <span className="badge-amber text-[10px]">Mais vendido</span> : null}
                      {stockWarning ? <span className="inline-flex rounded-badge bg-cafe-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-cafe-red-500">{stockWarning}</span> : null}
                    </div>
                    <Link href={`/products/${item.slug}`} className="font-semibold text-text-primary transition hover:text-cafe-orange-500">
                      {item.name}
                    </Link>
                    {item.variants?.length ? (
                      <p className="text-xs text-text-muted">
                        {item.variants.map((variant) => `${variant.name}: ${variant.value}`).join(' / ')}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                      <span>Unit: {currencyFormatter.format(item.price)}</span>
                      <span className="font-semibold text-cafe-orange-500">Total: {currencyFormatter.format(lineTotal)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span className="text-cafe-yellow-500">★★★★</span>
                      <span>27 avaliações</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 xl:flex-col xl:items-end xl:justify-between">
                    <QuantityStepper
                      value={item.quantity}
                      min={1}
                      max={item.stock}
                      onChange={(quantity) => updateQty(item.id, quantity)}
                    />
                    <div className="flex flex-wrap gap-3 text-sm">
                      <button type="button" className="text-cafe-orange-500 transition hover:text-cafe-orange-400" onClick={() => handleSaveForLater(item)}>
                        Salvar pra depois
                      </button>
                      <button type="button" className="text-cafe-red-500 transition hover:text-cafe-red-400" onClick={() => removeItem(item.id)}>
                        Remover
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Carrinho sem itens ativos"
            subtitle="Voce ainda tem produtos salvos para depois."
            action={{ href: '/products', label: 'Continuar comprando' }}
          />
        )}

        <section className="grid gap-3 rounded-card border border-cafe-orange-500/30 bg-cafe-orange-500/10 p-5">
          <h2 className="font-display text-xl font-semibold text-text-primary">Apoio simbolico, sem entrega fisica</h2>
          <p className="text-sm leading-6 text-text-secondary">
            Estes itens usam imagens ilustrativas da marca, mas nao sao produtos reais para envio. Ao continuar,
            voce esta fazendo uma doacao de apoio ao projeto CAFÉ STORE.
          </p>
        </section>

        {savedForLater.length > 0 ? (
          <section className="grid gap-4">
            <h2 className="font-display text-2xl font-semibold text-text-primary">Salvos pra depois</h2>
            <div className="grid gap-3">
              {savedForLater.map((item) => (
                <article key={item.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-background-card/70 p-3">
                  <Image src={item.image} alt={item.name} width={64} height={64} className="size-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-muted">{currencyFormatter.format(item.price)}</p>
                  </div>
                  <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={() => handleMoveBackToCart(item)}>
                    Voltar
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-text-primary">Outras formas de apoiar</h2>
            <p className="mt-1 text-sm text-text-secondary">Valores simbolicos para contribuir com o projeto.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recommendations.map((product) => (
              <Link key={product.href} href={product.href} className="card grid gap-3 p-3 transition hover:border-accent-primary/40">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-background-surface">
                  <Image src={product.image} alt={product.name} fill sizes="180px" className="object-cover" />
                </div>
                <span className="badge-amber w-fit">{product.label}</span>
                <p className="text-sm font-semibold text-text-primary">{product.name}</p>
                <p className="text-sm text-accent-glow">{currencyFormatter.format(product.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <aside className="sticky top-28 h-fit rounded-card border border-border-subtle bg-background-card p-5">
        <h2 className="font-display text-xl font-semibold text-text-primary">Resumo do pedido</h2>
        <div className="mt-5 grid gap-3">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4 text-text-secondary">
              <dt>Subtotal</dt>
              <dd>{currencyFormatter.format(total)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-text-secondary">
              <dt>Entrega</dt>
              <dd>Nao se aplica</dd>
            </div>
            <div className="flex justify-between gap-4 text-text-secondary">
              <dt>Taxas</dt>
              <dd>{taxes > 0 ? currencyFormatter.format(taxes) : 'Inclusas'}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border-subtle pt-3 text-lg font-bold text-text-primary">
              <dt>Total</dt>
              <dd>{currencyFormatter.format(finalTotal)}</dd>
            </div>
          </dl>
          <div className="grid gap-1 text-sm text-text-muted">
            <p>ou 10x de {currencyFormatter.format(finalTotal / 10)}</p>
          </div>
          <div className="rounded-button border border-cafe-orange-500/30 bg-cafe-orange-500/10 p-3 text-xs leading-5 text-text-secondary">
            Confirmo que entendo: isto e uma doacao simbolica. Nao ha envio, frete ou produto fisico garantido.
          </div>
          <Link href="/checkout" className="btn-primary mt-2 w-full h-12 text-base">
            Finalizar apoio
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/checkout" className="btn-secondary w-full text-center text-sm">
              Convidado
            </Link>
            <Link href="/login?callbackUrl=/checkout" className="btn-ghost w-full text-center text-sm">
              Login
            </Link>
          </div>
          <div className="mt-4 grid gap-2 border-t border-border-subtle pt-4 text-xs leading-5 text-text-muted">
            <p className="flex items-center gap-1">🔒 Pagamento seguro • SSL • Antifraude</p>
            <p className="flex items-center gap-1">💛 Doacao simbolica ao projeto</p>
            <p className="flex items-center gap-1">💳 Pix • Cartao • Mercado Pago • PayPal</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
