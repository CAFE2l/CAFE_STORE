'use client';

import { Prisma } from '@prisma/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import type { ProductDetail } from '@/lib/products';
import type { CartVariant } from '@/types';
import { cn } from '@/lib/utils';
import { WhatsappIcon } from '@/components/ui/WhatsappIcon';
import { Check, Heart, Loader2, Ruler, ShoppingCart } from 'lucide-react';
import { useVariantStore } from '@/lib/variantStore'

type ProductPurchasePanelProps = {
  product: ProductDetail;
  isFavorited?: boolean;
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

export function ProductPurchasePanel({ product, isFavorited = false, selectedVariants: externalVariants, onVariantsChange }: ProductPurchasePanelProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const variantOptions = useMemo(() => parseVariants(product.variants), [product.variants]);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(isFavorited);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favAnim, setFavAnim] = useState(false);
  const [zip, setZip] = useState('');
  const [shippingResult, setShippingResult] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pageUrl, setPageUrl] = useState('');
  const [internalVariants, setInternalVariants] = useState<Record<string, string>>(() =>
    Object.fromEntries(variantOptions.map((v) => [v.name, v.values[0] ?? ''])),
  );

  // sync selected variants to global store so gallery and other client parts can react
  const setSelected = useVariantStore((s) => s.setSelected);
  const variantRefs = useRef<Record<string, HTMLFieldSetElement | null>>({});

  const isExternal = externalVariants !== undefined;
  const selectedVariants = isExternal ? externalVariants : internalVariants;
  const setSelectedVariants = isExternal ? (onVariantsChange ?? (() => {})) : setInternalVariants;

  useEffect(() => {
    setSelected(product.id, selectedVariants);
  }, [selectedVariants, product.id, setSelected]);

  const image = product.images[0] ?? '/placeholder-product.svg';
  const inStock = product.stock > 0;
  const sku = product.sku ?? `CAF-${product.slug.slice(0, 3).toUpperCase()}-${product.id.slice(-6).toUpperCase()}`;
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.oldPrice!) * 100) : 0;
  const pixPrice = product.price * 0.95;
  const stockMessage = product.stock <= 0 ? 'Indisponivel' : 'Apoio simbolico disponivel';
  const stockType = product.stock <= 0 ? 'empty' : product.stock <= 3 ? 'low' : 'normal';


  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    setFavorite(isFavorited);
  }, [isFavorited]);

  const cartItemId = `${product.id}-${JSON.stringify(selectedVariants)}`;
  const isCurrentInCart = cartItems.some((item) => item.id === cartItemId);

  const getCartVariants = useCallback((): CartVariant[] => {
    return Object.entries(selectedVariants)
      .filter(([, value]) => value)
      .map(([name, value]) => ({ name, value }));
  }, [selectedVariants]);

  const handleAddToCart = useCallback(async () => {
    const missing = variantOptions.find((v) => !selectedVariants[v.name]);
    if (missing) {
      variantRefs.current[missing.name]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (addLoading || addedSuccess || isCurrentInCart) return;

    setAddLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    addItem({
      id: cartItemId,
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
  }, [addItem, addLoading, addedSuccess, cartItemId, getCartVariants, image, isCurrentInCart, product, quantity, selectedVariants, variantOptions]);

  function handleBuyNow() {
    if (isCurrentInCart) {
      router.push('/checkout');
      return;
    }
    void handleAddToCart();
    setTimeout(() => router.push('/checkout'), 500);
  }

  async function handleFavorite() {
    if (favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.status === 401) {
        router.push(`/login?redirect=/products/${product.slug}`);
        return;
      }

      if (!response.ok) return;

      const payload = (await response.json()) as { data?: { favorited?: boolean } };
      const nextFavorite = Boolean(payload.data?.favorited);
      setFavorite(nextFavorite);

      if (nextFavorite) {
        setFavAnim(true);
        setTimeout(() => setFavAnim(false), 600);
      }
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handleShippingQuote() {
    setShippingLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setShippingLoading(false);
    setShippingResult('Este apoio nao possui frete: as imagens sao ilustrativas e nao ha envio de produto fisico.');
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(pageUrl || '');
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
      {sku ? <p className="text-xs text-zinc-600">SKU: {sku}</p> : null}

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
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white">
              -{discountPercent}%
            </span>
          ) : null}
        </div>
        <span className="text-sm text-zinc-400">
          doacao simbolica de {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
        <span className="text-sm text-brand">
          Pix: {pixPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (5% off)
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-zinc-300 shadow-sm backdrop-blur-md">
        <p className="font-semibold text-white">Aviso importante</p>
        <p className="mt-1">
          Este item e apenas uma doacao simbolica ao projeto CAFÉ STORE. A imagem e ilustrativa,
          nao representa um produto real e nao havera envio fisico.
        </p>
      </div>


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
                !selectedVariants[variant.name] && 'ring-2 ring-brand/50',
              )}
            >
              <legend className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                {variant.name}
                {variant.name === 'Tamanho' || variant.name === 'Cor' ? (
                  <button type="button" className="inline-flex items-center gap-1 text-xs text-zinc-600 underline underline-offset-2 transition hover:text-brand" onClick={(e) => { e.preventDefault(); alert('Guia de tamanhos disponivel em breve.'); }}>
                    <Ruler className="h-3 w-3" /> Guia de tamanhos
                  </button>
                ) : null}
              </legend>
              <div className="flex flex-wrap gap-2">
                {variant.values.map((value) => {
                  const isSelected = selectedVariants[variant.name] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={cn(
                        'rounded-full px-5 py-2 text-sm font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-brand text-white shadow-[0_0_16px_rgba(249,115,22,0.35)]'
                          : 'border border-zinc-700 text-zinc-400 hover:border-brand/50 hover:text-white hover:bg-zinc-800/50',
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
        <div className="inline-flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900/60 p-1">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-brand/15 hover:text-brand disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
            aria-label="Diminuir quantidade"
            disabled={quantity <= 1}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
          <span className="flex w-10 items-center justify-center text-base font-bold text-white">{quantity}</span>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-brand/15 hover:text-brand disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
            aria-label="Aumentar quantidade"
            disabled={typeof product.stock === 'number' && quantity >= product.stock}
            onClick={() => setQuantity(quantity + 1)}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {isCurrentInCart ? (
          <Link
            href="/cart"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/25 bg-green-500/10 py-4 text-base font-semibold text-green-200 transition-all hover:border-green-400/40 hover:bg-green-500/15"
          >
            <Check className="h-4 w-4" />
            No carrinho → Ver
          </Link>
        ) : (
          <Button
            className={cn(
              'w-full py-4 text-base relative overflow-hidden transition-all duration-300',
              addedSuccess && '!bg-green-600/80 !border-green-500/50',
            )}
            disabled={!inStock || addLoading || addedSuccess}
            onClick={() => void handleAddToCart()}
          >
            {addLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Adicionando...
              </span>
            ) : addedSuccess ? (
              <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Adicionado!</span>
            ) : inStock ? (
              <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Adicionar apoio ao carrinho</span>
            ) : (
              '✕ Indisponivel'
            )}
          </Button>
        )}
        {inStock ? (
          <Button variant="secondary" className="w-full py-4 text-base no-underline" onClick={handleBuyNow}>
            Apoiar agora
          </Button>
        ) : null}
      </div>

      {/* Favoritar */}
      <div className="relative">
        <button
          type="button"
          disabled={favoriteLoading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all duration-200',
            favorite ? 'text-brand' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40',
            favoriteLoading && 'cursor-wait opacity-70',
          )}
          onClick={handleFavorite}
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-all duration-300',
              favAnim && 'scale-[1.8]',
              favorite ? 'fill-brand' : '',
            )}
          />
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
          href={`https://wa.me/5541996713782?text=${encodeURIComponent(`${product.name}${pageUrl ? ` - ${pageUrl}` : ''}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid size-8 place-items-center rounded-lg bg-zinc-800 text-zinc-500 transition-all hover:bg-green-600/20 hover:text-green-400"
          aria-label="Compartilhar no WhatsApp"
        >
          <WhatsappIcon className="h-4 w-4" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${product.name} - `)}&url=${encodeURIComponent(pageUrl)}`}
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

      {/* Entrega */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold text-zinc-300">Entrega</h4>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-brand/60 focus:outline-none"
              inputMode="numeric"
              maxLength={9}
              placeholder="CEP opcional"
              value={zip}
              onChange={handleZipMask}
            />
          </div>
          <Button type="button" variant="secondary" onClick={handleShippingQuote} disabled={shippingLoading}>
            {shippingLoading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
            ) : 'Ver aviso'}
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
          Este apoio nao gera frete
        </a>
      </div>

    </div>
  );
}
