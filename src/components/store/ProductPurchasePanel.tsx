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
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() =>
    Object.fromEntries(variantOptions.map((variant) => [variant.name, variant.values[0] ?? ''])),
  );
  const image = product.images[0] ?? '/placeholder-product.svg';
  const inStock = product.stock > 0;

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

  return (
    <div className="grid gap-6">
      {variantOptions.length > 0 ? (
        <div className="grid gap-5">
          {variantOptions.map((variant) => (
            <fieldset key={variant.name} className="grid gap-3">
              <legend className="text-sm font-medium text-text-secondary">{variant.name}</legend>
              <div className="flex flex-wrap gap-2">
                {variant.values.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      selectedVariants[variant.name] === value
                        ? 'led-amber rounded-xl bg-accent-primary/10 px-4 py-2 text-sm font-semibold text-accent-primary'
                        : 'rounded-xl border border-white/10 px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary/40 hover:text-text-primary'
                    }
                    onClick={() =>
                      setSelectedVariants((current) => ({
                        ...current,
                        [variant.name]: value,
                      }))
                    }
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper value={quantity} min={1} max={product.stock || undefined} onChange={setQuantity} />
        <span className="text-sm text-text-secondary">{inStock ? `${product.stock} unidades` : 'Sem estoque'}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button disabled={!inStock} onClick={handleAddToCart}>
          Adicionar ao Carrinho
        </Button>
        <Button
          variant="secondary"
          disabled={!inStock}
          onClick={() => {
            handleAddToCart();
            router.push('/checkout');
          }}
        >
          Comprar Agora
        </Button>
      </div>
    </div>
  );
}
