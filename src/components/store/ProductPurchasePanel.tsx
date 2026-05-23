'use client';

import { Prisma } from '@prisma/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCartStore } from '@/store/cart';
import type { ProductDetail } from '@/lib/products';
import type { CartVariant } from '@/types';
import { cn } from '@/lib/utils';

type ProductPurchasePanelProps = {
  product: ProductDetail;
  selectedVariants?: Record<string, string>;
  onVariantsChange?: (variants: Record<string, string>) => void;
};

type VariantOption = {
  name: string;
  values: string[];
};

function parseVariants(variants: Prisma.JsonValue): VariantOption[] {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((variant): VariantOption | null => {
      if (
        typeof variant === 'object' && variant !== null &&
        'name' in variant && 'values' in variant &&
        typeof variant.name === 'string' && Array.isArray(variant.values)
      ) {
        return {
          name: variant.name,
          values: variant.values.filter((value): value is string => typeof value === 'string'),
        };
      }
      return null;
    })
    .filter((variant): variant is VariantOption => Boolean(variant));
}

export function ProductPurchasePanel({ product, selectedVariants: externalVariants, onVariantsChange }: ProductPurchasePanelProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const variantOptions = useMemo(() => parseVariants(product.variants), [product.variants]);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [favAnim, setFavAnim] = useState(false);
  const [zip, setZip] = useState('');
  const [shippingResult, setShippingResult] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [internalVariants, setInternalVariants] = useState<Record<string, string>>(() =>
    Object.fromEntries(variantOptions.map((v) => [v.name, v.values[0] ?? ''])),
  );
  const variantRefs = useRef<Record<string, HTMLFieldSetElement | null>>({});

  const isExternal = externalVariants !== undefined;
  const selectedVariants = isExternal ? externalVariants : internalVariants;
  const setSelectedVariants = isExternal ? (onVariantsChange ?? (() => {})) : setInternalVariants;

  const image = product.images[0] ?? '/placeholder-product.svg';
  const inStock = product.stock > 0;
  const sku = `CAF-${product.slug.slice(0, 3).toUpperCase()}-${product.id.slice(-6).toUpperCase()}`;
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.oldPrice!) * 100) : 0;
  const pixPrice = product.price * 0.95;
  const installmentPrice = product.price / 12;
  const stockMessage = product.stock <= 0 ? 'Sem estoque' : product.stock <= 3 ? `Restam ${product.stock} unidades` : `${product.stock} unidades disponiveis`;
  const stockType = product.stock <= 0 ? 'empty' : product.stock <= 3 ? 'low' : 'normal';

  const [countdown, setCountdown] = useState<string | null>(null);
  const [countdownEnded, setCountdownEnded] = useState(false);

  useEffect(() => {
    if (!hasDiscount) return;
    const end = Date.now() + 4 * 60 * 60 * 1000;
    function tick() {
      const diff = end - Date.now();
      if (diff <= 0) { setCountdown(null); setCountdownEnded(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hasDiscount]);

  function getCartVariants(): CartVariant[] {
    return Object.entries(selectedVariants)
      .filter(([, value]) => value)
      .map(([name, value]) => ({ name, value }));
  }

  const handleAddToCart = useCallback(() => {
    const missing = variantOptions.find((v) => !selectedVariants[v.name]);
    if (missing) {
      variantRefs.current[missing.name]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setAddLoading(true);
    setTimeout(() => {
      addItem({
        id: `${product.id}-${JSON.stringify(selectedVariants)}`,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image,
        price: product.price,
        quantity,
        stock: product.stock,
        variants: getCartVariants(),
      });
      setAddLoading(false);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    }, 400);
  }, [product, selectedVariants, quantity, image, addItem, variantOptions]);

  function handleBuyNow() {
    handleAddToCart();
    setTimeout(() => router.push('/checkout'), 500);
  }

  function handleFavorite() {
    setFavorite((v) => !v);
    setFavAnim(true);
    setTimeout(() => setFavAnim(false), 600);
  }

  async function handleShippingQuote() {
    const cleanZip = zip.replace(/\D/g, '');
    if (cleanZip.length !== 8) {
      setShippingResult('Digite um CEP com 8 numeros.');
      return;
    }
    setShippingLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setShippingLoading(false);
    setShippingResult(`📦 Sedex — R$ 18,90 (2 dias) • 📦 PAC — R$ 9,90 (7 dias) • ✓ Frete gratis acima de R$ 299`);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handleZipMask(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    setZip(raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw);
  }

  useEffect(() => {
    if (addedSuccess) setQuantity(1);
  }, [addedSuccess]);

  const renderStars = (full: number) => (
    <span className="flex items-center gap-0.5 text-[#FFD000]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={cn('text-base', i < full ? 'opacity-100' : 'opacity-30')}>★</span>
      ))}
    </span>
  );

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      {/* Rating */}
      {product.reviewCount > 0 ? (
        <div className="flex items-center gap-2 text-sm">
          {renderStars(Math.round(product.averageRating))}
          <span className="font-semibold text-white">{product.averageRating.toFixed(1)}</span>
          <span className="text-zinc-600">({product.reviewCount})</span>
          <a href="#avaliacoes" className="ml-1 text-xs text-zinc-500 underline underline-offset-2 transition hover:text-brand">
            Ver avaliações
          </a>
        </div>
      ) : null}

      {/* SKU */}
      <p className="text-xs text-zinc-600">SKU: {sku}</p>

      {/* Price */}
      <div className="flex flex-col gap-1">
        {hasDiscount ? (
          <span className="text-sm text-zinc-600 line-through">
            {product.oldPrice!.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        ) : null}
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-black text-brand animate-scaleIn">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          {hasDiscount ? (
            <span className="rounded-full bg-[#FF3C38]/15 px-2.5 py-0.5 text-xs font-bold text-[#FF3C38]">
              -{discountPercent}%
            </span>
          ) : null}
        </div>
        <span className="text-sm text-zinc-400">
          ou 12x de {installmentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros
        </span>
        <span className="text-sm text-blue-400">
          🟦 à vista no Pix: {pixPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (5% off)
        </span>
      </div>

      {/* Countdown */}
      {countdown ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#FF3C38]/20 bg-[#FF3C38]/10 px-4 py-2.5">
          <span className="text-sm text-zinc-300">⏰ Oferta termina em:</span>
          <span className="font-mono text-lg font-bold text-[#FF3C38]">{countdown}</span>
        </div>
      ) : null}

      {/* Stock */}
      <div className={cn(
        'flex items-center gap-2 text-sm',
        stockType === 'empty' && 'text-red-400',
        stockType === 'low' && 'text-orange-400',
        stockType === 'normal' && 'text-green-400',
      )}>
        {stockType === 'empty' ? (
          <><span>✕</span><span>{stockMessage}</span></>
        ) : stockType === 'low' ? (
          <><span>⚡</span><span>{stockMessage}</span></>
        ) : (
          <><span>✓</span><span>{stockMessage}</span></>
        )}
      </div>

      <div className="h-px bg-zinc-800" />

      {/* Variants */}
      {variantOptions.length > 0 ? (
        <div className="grid gap-5">
          {variantOptions.map((variant) => (
            <fieldset
              key={variant.name}
              ref={(el) => { variantRefs.current[variant.name] = el; }}
              className={cn(
                'grid gap-3 rounded-lg p-1 -mx-1 transition-all',
                !selectedVariants[variant.name] && 'ring-2 ring-[#FF3C38]',
              )}
            >
              <legend className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                {variant.name}
                {variant.name === 'Tamanho' || variant.name === 'Cor' ? (
                  <button type="button" className="text-xs text-zinc-600 underline underline-offset-2 transition hover:text-brand" onClick={(e) => { e.preventDefault(); alert('Guia de tamanhos disponivel em breve.'); }}>
                    📏 Guia de tamanhos
                  </button>
                ) : null}
              </legend>
              <div className="flex flex-wrap gap-2">
                {variant.values.map((value) => {
                  const isSelected = selectedVariants[variant.name] === value;
                  const isSize = variant.name === 'Tamanho' || variant.name === 'Cor';
                  return (
                    <button
                      key={value}
                      type="button"
                      className={cn(
                        'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-brand/15 text-brand ring-1 ring-brand/40 shadow-glow-sm'
                          : 'border border-zinc-700 text-zinc-400 hover:border-brand/40 hover:text-white hover:bg-zinc-800/50',
                      )}
                      onClick={() => setSelectedVariants({ ...selectedVariants, [variant.name]: value })}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}

      {/* Quantity */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-400">Quantidade</label>
        <QuantityStepper value={quantity} min={1} max={product.stock || undefined} onChange={setQuantity} />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          className={cn(
            'w-full py-4 text-base relative overflow-hidden transition-all duration-300',
            addedSuccess && '!bg-green-600/80 !border-green-500/50',
          )}
          disabled={!inStock || addLoading}
          onClick={handleAddToCart}
        >
          {addLoading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
              Adicionando...
            </span>
          ) : addedSuccess ? (
            <span className="flex items-center gap-2">✓ Adicionado ao Carrinho</span>
          ) : inStock ? (
            '🛒 Adicionar ao Carrinho'
          ) : (
            '✕ Indisponivel'
          )}
        </Button>
        {inStock ? (
          <Button variant="secondary" className="w-full py-4 text-base" onClick={handleBuyNow}>
            ⚡ Comprar Agora
          </Button>
        ) : null}
      </div>

      {/* Favoritar */}
      <div className="relative">
        <button
          type="button"
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all duration-200',
            favorite ? 'text-brand' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40',
          )}
          onClick={handleFavorite}
        >
          <span className={cn('inline-block transition-transform duration-300', favAnim && 'scale-[1.8]')}>
            {favorite ? '♥' : '♡'}
          </span>
          {favorite ? 'Nos seus favoritos' : 'Adicionar aos favoritos'}
        </button>
        {favAnim ? (
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="absolute left-0 top-0 h-2 w-2 rounded-full bg-brand animate-[favoriteBurst_0.6s_ease-out_forwards]"
                style={{
                  transform: `rotate(${i * 60}deg) translateY(-16px)`,
                  animationDelay: `${i * 40}ms`,
                  opacity: 0,
                }}
              />
            ))}
          </span>
        ) : null}
      </div>

      {/* Compartilhar */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-zinc-500">Compartilhar:</span>
        <a
          href={`https://wa.me/5541996713782?text=${encodeURIComponent(`${product.name} - ${window.location.href}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid size-8 place-items-center rounded-lg bg-zinc-800 text-zinc-500 transition-all hover:bg-green-600/20 hover:text-green-400"
          aria-label="Compartilhar no WhatsApp"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${product.name} - `)}&url=${encodeURIComponent(window.location.href)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid size-8 place-items-center rounded-lg bg-zinc-800 text-zinc-500 transition-all hover:bg-sky-600/20 hover:text-sky-400"
          aria-label="Compartilhar no X"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        </a>
        <button
          type="button"
          className={cn(
            'grid size-8 place-items-center rounded-lg text-xs font-medium transition-all',
            copiedLink ? 'bg-green-600/20 text-green-400' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white',
          )}
          onClick={handleCopyLink}
          aria-label="Copiar link"
        >
          {copiedLink ? '✓' :
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          }
        </button>
      </div>

      <div className="h-px bg-zinc-800" />

      {/* Frete */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold text-zinc-300">Calcular frete e prazo</h4>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-brand/60 focus:outline-none"
              inputMode="numeric"
              maxLength={9}
              placeholder="00000-000"
              value={zip}
              onChange={handleZipMask}
            />
          </div>
          <Button type="button" variant="secondary" onClick={handleShippingQuote} disabled={shippingLoading}>
            {shippingLoading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
            ) : 'Calcular'}
          </Button>
        </div>
        {shippingResult ? (
          <p className="animate-fadeIn text-sm leading-6 text-zinc-400">{shippingResult}</p>
        ) : null}
        <a
          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-600 underline underline-offset-2 transition hover:text-zinc-400"
        >
          Não sei meu CEP
        </a>
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: '🔒', label: 'Pagamento seguro', sub: 'Pix · Cartão · PayPal' },
          { icon: '🛡️', label: 'Garantia CAFÉ', sub: 'Troca em 7 dias' },
          { icon: '📦', label: 'Frete rápido', sub: 'Todo o Brasil' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-center transition-colors hover:border-brand/20">
            <span className="text-lg">{item.icon}</span>
            <p className="mt-1 text-[11px] font-semibold text-white">{item.label}</p>
            <p className="text-[10px] text-zinc-600">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
