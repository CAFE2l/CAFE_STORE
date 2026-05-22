'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCartStore } from '@/store/cart';
import type { CartItem } from '@/types';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const freeShippingGoal = 299;
const giftGoal = 220;
const taxRate = 0;
const coupons = {
  CAFE15: { label: 'Cupom CAFE15 aplicado', value: 15 },
  FIRE10: { label: 'Cupom FIRE10 aplicado', percent: 0.1 },
};

const deliveryOptions = [
  { id: 'normal', name: 'Normal', eta: '5 a 9 dias uteis', price: 18.9 },
  { id: 'express', name: 'Expresso', eta: '2 a 4 dias uteis', price: 34.9 },
  { id: 'pickup', name: 'Retirada', eta: 'combinar pelo atendimento', price: 0 },
] as const;

const recommendations = [
  {
    name: 'Caneca Preta Cafe Store',
    href: '/products/caneca-preta-cafe-store',
    image: '/images/produtos/caneca/preta/banner.png',
    price: 49.9,
    label: 'Complete o kit',
  },
  {
    name: 'Chaveiro Mascote Cafe Store',
    href: '/products/chaveiro-mascote-cafe-store',
    image: '/images/produtos/chaveiro/design.png',
    price: 24.9,
    label: 'Brinde ideal',
  },
  {
    name: 'Moletom Limited Edition Cafe Store',
    href: '/products/moletom-limited-edition-cafe-store',
    image: '/images/produtos/moletons/banner.png',
    price: 199.9,
    label: 'Upgrade disponivel',
  },
];

function getItemSavings(item: CartItem) {
  return item.price >= 100 ? 20 * item.quantity : 0;
}

function getStockWarning(item: CartItem) {
  if (!item.stock || item.stock > 3) return null;
  return item.stock === 1 ? 'so 1 resta!' : `so ${item.stock} restam!`;
}

function getEstimatedDelivery(optionId: string) {
  const now = new Date();
  const days = optionId === 'express' ? 4 : optionId === 'pickup' ? 2 : 9;
  const date = new Date(now);
  date.setDate(now.getDate() + days);

  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

export function CartPageClient() {
  const { clearCart, items, removeItem, total, updateQty } = useCartStore();
  const [zip, setZip] = useState('');
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<(typeof deliveryOptions)[number]['id']>('normal');
  const [coupon, setCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<keyof typeof coupons | null>(null);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [isGift, setIsGift] = useState(false);
  const [sustainablePackage, setSustainablePackage] = useState(false);

  const selectedDelivery = deliveryOptions.find((option) => option.id === deliveryOption) ?? deliveryOptions[0];
  const itemSavings = items.reduce((sum, item) => sum + getItemSavings(item), 0);
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const selectedCoupon = coupons[appliedCoupon];
    return 'percent' in selectedCoupon ? total * selectedCoupon.percent : selectedCoupon.value;
  }, [appliedCoupon, total]);
  const discount = Math.min(total, couponDiscount);
  const shipping = total >= freeShippingGoal ? 0 : shippingCalculated ? selectedDelivery.price : 0;
  const taxes = total * taxRate;
  const sustainableFee = sustainablePackage ? 2 : 0;
  const finalTotal = Math.max(0, total - discount + shipping + taxes + sustainableFee);
  const freeShippingRemaining = Math.max(0, freeShippingGoal - total);
  const giftRemaining = Math.max(0, giftGoal - total);
  const freeShippingProgress = Math.min(100, (total / freeShippingGoal) * 100);
  const cashback = Math.floor(finalTotal / 5);

  function handleApplyCoupon() {
    const normalizedCoupon = coupon.trim().toUpperCase() as keyof typeof coupons;

    if (normalizedCoupon in coupons) {
      setAppliedCoupon(normalizedCoupon);
      setCouponFeedback(coupons[normalizedCoupon].label);
      return;
    }

    setAppliedCoupon(null);
    setCouponFeedback('Cupom invalido ou expirado.');
  }

  function handleCalculateShipping() {
    const cleanZip = zip.replace(/\D/g, '');

    if (cleanZip.length !== 8) {
      setShippingCalculated(false);
      return;
    }

    setShippingCalculated(true);
  }

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
        subtitle="Explore a vitrine e adicione produtos oficiais CAFÉ Store para continuar."
        action={{ href: '/products', label: 'Ver produtos' }}
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
              const hasFreeShipping = item.price * item.quantity >= 120;

              return (
                <article key={item.id} className="card grid gap-4 p-4 sm:grid-cols-[7rem_1fr] xl:grid-cols-[7rem_1fr_auto]">
                  <Link href={`/products/${item.slug}`} className="relative aspect-square overflow-hidden rounded-xl bg-background-surface">
                    <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover transition hover:scale-105" />
                  </Link>
                  <div className="grid content-start gap-3">
                    <div className="flex flex-wrap gap-2">
                      {index === 0 ? <span className="badge-amber">Mais vendido da categoria</span> : null}
                      {hasFreeShipping ? <span className="badge-amber">Elegivel a frete gratis</span> : null}
                      {stockWarning ? <span className="rounded-full bg-status-error/15 px-3 py-1 text-xs font-semibold text-status-error">{stockWarning}</span> : null}
                    </div>
                    <Link href={`/products/${item.slug}`} className="font-semibold text-text-primary hover:text-accent-glow">
                      {item.name}
                    </Link>
                    {item.variants?.length ? (
                      <p className="text-xs text-text-muted">
                        {item.variants.map((variant) => `${variant.name}: ${variant.value}`).join(' / ')}
                      </p>
                    ) : null}
                    <div className="grid gap-1 text-sm text-text-secondary sm:grid-cols-2">
                      <p>Unitario: {currencyFormatter.format(item.price)}</p>
                      <p className="font-semibold text-text-primary">Total: {currencyFormatter.format(lineTotal)}</p>
                    </div>
                    <div className="grid gap-1 text-xs text-text-muted">
                      <p>★ 4.8 em 27 avaliacoes</p>
                      <p>{38 + index * 9} pessoas estao olhando agora. Adicionado {47 + index * 5} vezes hoje.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 xl:grid xl:justify-items-end">
                    <QuantityStepper
                      value={item.quantity}
                      min={1}
                      max={item.stock}
                      onChange={(quantity) => updateQty(item.id, quantity)}
                    />
                    <div className="flex flex-wrap gap-3 text-sm">
                      <button type="button" className="text-accent-glow hover:text-accent-primary" onClick={() => handleSaveForLater(item)}>
                        Salvar pra depois
                      </button>
                      <button type="button" className="text-status-error transition hover:brightness-125" onClick={() => removeItem(item.id)}>
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

        <section className="grid gap-4 rounded-2xl border border-white/10 bg-background-card/70 p-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-text-primary">Cupons e beneficios</h2>
            <p className="mt-1 text-sm text-text-secondary">Sugestao disponivel: use CAFE15 para economizar R$ 15.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input-field"
              placeholder="Digite seu cupom"
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
            />
            <button type="button" className="btn-secondary" onClick={handleApplyCoupon}>
              Aplicar
            </button>
          </div>
          {couponFeedback ? (
            <p className={appliedCoupon ? 'text-sm text-status-success' : 'text-sm text-status-error'}>{couponFeedback}</p>
          ) : null}
          <div className="grid gap-2 text-sm text-text-secondary md:grid-cols-2">
            <p>Voce vai ganhar {cashback} R-Coins nessa compra.</p>
            <p>{giftRemaining > 0 ? `Adicione ${currencyFormatter.format(giftRemaining)} e ganhe um brinde.` : 'Brinde liberado para este pedido.'}</p>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-white/10 bg-background-card/70 p-5">
          <h2 className="font-display text-2xl font-semibold text-text-primary">Entrega e presente</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              className="input-field"
              inputMode="numeric"
              maxLength={9}
              placeholder="Calcule com seu CEP"
              value={zip}
              onChange={(event) => setZip(event.target.value)}
            />
            <button type="button" className="btn-secondary" onClick={handleCalculateShipping}>
              Calcular frete
            </button>
          </div>
          {shippingCalculated ? (
            <div className="grid gap-3">
              {deliveryOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-background-surface p-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryOption === option.id}
                      onChange={() => setDeliveryOption(option.id)}
                    />
                    <span>
                      <span className="block font-semibold text-text-primary">{option.name}</span>
                      <span className="text-text-muted">{option.eta}</span>
                    </span>
                  </span>
                  <span className="font-semibold text-text-primary">
                    {option.price === 0 || total >= freeShippingGoal ? 'Gratis' : currencyFormatter.format(option.price)}
                  </span>
                </label>
              ))}
              <p className="text-sm text-text-secondary">Chega ate {getEstimatedDelivery(deliveryOption)}.</p>
            </div>
          ) : (
            <p className="text-sm text-text-muted">Informe o CEP para ver normal, expresso e retirada.</p>
          )}
          <div className="grid gap-3 text-sm text-text-secondary md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
              <input type="checkbox" checked={isGift} onChange={(event) => setIsGift(event.target.checked)} />
              E presente, esconder precos e adicionar mensagem
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
              <input
                type="checkbox"
                checked={sustainablePackage}
                onChange={(event) => setSustainablePackage(event.target.checked)}
              />
              Embalagem sustentavel +R$ 2
            </label>
          </div>
          {isGift ? (
            <textarea className="input-field min-h-24" placeholder="Mensagem para o cartao do presente" />
          ) : null}
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
            <h2 className="font-display text-2xl font-semibold text-text-primary">Clientes tambem levaram</h2>
            <p className="mt-1 text-sm text-text-secondary">Upsells rapidos para completar o carrinho.</p>
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

      <aside className="glass sticky top-28 h-fit rounded-2xl p-5 shadow-warm">
        <h2 className="font-display text-2xl font-semibold text-text-primary">Resumo do pedido</h2>
        <div className="mt-5 grid gap-3">
          <div className="grid gap-2">
            <div className="h-3 overflow-hidden rounded-full bg-background-surface">
              <div className="h-full rounded-full bg-accent-primary transition-all" style={{ width: `${freeShippingProgress}%` }} />
            </div>
            <p className="text-xs text-text-secondary">
              {freeShippingRemaining > 0
                ? `Falta ${currencyFormatter.format(freeShippingRemaining)} pra ganhar frete gratis.`
                : 'Frete gratis desbloqueado.'}
            </p>
          </div>
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4 text-text-secondary">
              <dt>Subtotal</dt>
              <dd>{currencyFormatter.format(total)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-status-success">
              <dt>Desconto</dt>
              <dd>-{currencyFormatter.format(discount)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-text-secondary">
              <dt>Frete</dt>
              <dd>{shippingCalculated ? currencyFormatter.format(shipping) : 'calcule o frete'}</dd>
            </div>
            <div className="flex justify-between gap-4 text-text-secondary">
              <dt>Taxas</dt>
              <dd>{taxes > 0 ? currencyFormatter.format(taxes) : 'Inclusas'}</dd>
            </div>
            {sustainableFee > 0 ? (
              <div className="flex justify-between gap-4 text-text-secondary">
                <dt>Embalagem sustentavel</dt>
                <dd>{currencyFormatter.format(sustainableFee)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-border-subtle pt-4 text-lg font-semibold text-text-primary">
              <dt>Total</dt>
              <dd>{currencyFormatter.format(finalTotal)}</dd>
            </div>
          </dl>
          <div className="grid gap-1 text-sm text-text-secondary">
            <p>ou 10x de {currencyFormatter.format(finalTotal / 10)}</p>
            <p className="text-status-success">Voce esta economizando {currencyFormatter.format(discount + itemSavings)}.</p>
            <p>Timeline: pagou {'->'} separou {'->'} enviou {'->'} chegou.</p>
          </div>
          <Link href="/checkout" className="btn-primary mt-3 w-full animate-pulse">
            Finalizar compra
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/checkout" className="btn-secondary w-full text-center">
              Comprar como convidado
            </Link>
            <Link href="/login?callbackUrl=/checkout" className="btn-ghost w-full text-center">
              Login rapido
            </Link>
          </div>
          <Link href="/products" className="btn-ghost w-full text-center">
            Continuar comprando
          </Link>
          <button type="button" className="btn-ghost w-full" onClick={clearCart}>
            Limpar carrinho
          </button>
        </div>
        <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-xs leading-5 text-text-muted">
          <p>Compra segura: SSL, antifraude, Pix, cartao, Mercado Pago e PayPal.</p>
          <p>Garantia de 30 dias ou seu dinheiro de volta em produtos elegiveis.</p>
          <Link href="/services" className="text-accent-glow hover:text-accent-primary">
            Politica de devolucao e atendimento
          </Link>
          <p>Transparencia: produto {currencyFormatter.format(total * 0.76)}, operacao {currencyFormatter.format(total * 0.14)}, impostos inclusos.</p>
        </div>
      </aside>
    </div>
  );
}
