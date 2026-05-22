'use client';

import { Prisma } from '@prisma/client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCartStore } from '@/store/cart';
import type { ProductDetail } from '@/lib/products';
import type { CartVariant } from '@/types';

type ProductPurchasePanelProps = {
  product: ProductDetail;
};

type VariantOption = {
  name: string;
  values: string[];
};

function parseVariants(variants: Prisma.JsonValue): VariantOption[] {
  if (!Array.isArray(variants)) {
    return [];
  }

  return variants
    .map((variant): VariantOption | null => {
      if (
        typeof variant === 'object' &&
        variant !== null &&
        'name' in variant &&
        'values' in variant &&
        typeof variant.name === 'string' &&
        Array.isArray(variant.values)
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

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const variantOptions = useMemo(() => parseVariants(product.variants), [product.variants]);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [zip, setZip] = useState('');
  const [shippingResult, setShippingResult] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() =>
    Object.fromEntries(variantOptions.map((variant) => [variant.name, variant.values[0] ?? ''])),
  );
  const image = product.images[0] ?? '/placeholder-product.svg';
  const inStock = product.stock > 0;
  const sku = `CAF-${product.slug.slice(0, 3).toUpperCase()}-${product.id.slice(-6).toUpperCase()}`;
  const installments = product.price / 12;
  const stockMessage =
    product.stock <= 0 ? 'Sem estoque' : product.stock <= 3 ? `Restam ${product.stock} unidades` : `${product.stock} unidades disponiveis`;

  function getCartVariants(): CartVariant[] {
    return Object.entries(selectedVariants)
      .filter(([, value]) => value)
      .map(([name, value]) => ({ name, value }));
  }

  function handleAddToCart() {
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
  }

  function handleShippingQuote() {
    const cleanZip = zip.replace(/\D/g, '');

    if (cleanZip.length !== 8) {
      setShippingResult('Digite um CEP com 8 numeros.');
      return;
    }

    setShippingResult('Normal: 5 a 9 dias uteis | Expresso: 2 a 4 dias uteis | Retirada: combinar pelo atendimento.');
  }

  return (
    <div className="grid gap-6 rounded-card border border-border-subtle bg-background-card p-5">
      <div className="grid gap-2 text-sm text-text-secondary">
        <p>
          SKU: <span className="font-mono font-semibold text-text-primary">{sku}</span>
        </p>
        <p className="text-text-muted">
          ou 12x de{' '}
          <span className="font-semibold text-cafe-orange-500">
            {installments.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>{' '}
          sem juros
        </p>
      </div>
      {variantOptions.length > 0 ? (
        <div className="grid gap-5">
          {variantOptions.map((variant) => (
            <fieldset key={variant.name} className="grid gap-3">
              <legend className="text-sm font-medium text-text-secondary">
                {variant.name} <span className="text-text-muted">({stockMessage})</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {variant.values.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      selectedVariants[variant.name] === value
                        ? 'rounded-button bg-cafe-orange-500/15 px-4 py-2 text-sm font-semibold text-cafe-orange-500 ring-1 ring-cafe-orange-500/40'
                        : 'rounded-button border border-border-subtle px-4 py-2 text-sm text-text-secondary transition hover:border-cafe-orange-500/40 hover:text-text-primary'
                    }
                    onClick={() =>
                      setSelectedVariants((current) => ({
                        ...current,
                        [variant.name]: value,
                      }))
                    }
                  >
                    {value}
                    <span className="ml-2 text-xs opacity-70">{product.stock} un.</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper value={quantity} min={1} max={product.stock || undefined} onChange={setQuantity} />
        <span className="text-sm font-medium text-cafe-orange-500">{stockMessage}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button className="w-full" disabled={!inStock} onClick={handleAddToCart}>
          Adicionar ao Carrinho
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          disabled={!inStock}
          onClick={() => {
            handleAddToCart();
            router.push('/checkout');
          }}
        >
          Comprar Agora
        </Button>
      </div>
      <Button variant="ghost" className="w-full" onClick={() => setFavorite((current) => !current)}>
        {favorite ? '♥ Remover dos favoritos' : '♡ Adicionar aos favoritos'}
      </Button>
      <div className="grid gap-3 border-t border-border-subtle pt-5">
        <label className="grid gap-2 text-sm text-text-secondary">
          Calcular frete e prazo
          <div className="flex gap-2">
            <input
              className="input-field"
              inputMode="numeric"
              maxLength={9}
              placeholder="00000-000"
              value={zip}
              onChange={(event) => setZip(event.target.value)}
            />
            <Button type="button" variant="secondary" onClick={handleShippingQuote}>
              Calcular
            </Button>
          </div>
        </label>
        {shippingResult ? <p className="text-sm leading-6 text-text-secondary">{shippingResult}</p> : null}
        <div className="grid gap-1 text-xs leading-5 text-text-muted">
          <p className="flex items-center gap-1">📦 Frete grátis acima de R$ 299</p>
          <p className="flex items-center gap-1">↩ Devolução em até 7 dias</p>
        </div>
      </div>
    </div>
  );
}
