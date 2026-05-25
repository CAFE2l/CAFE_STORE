'use client'

import React from 'react'
import { useProductVariants } from '@/hooks/useProductVariants'
import type { Product } from '@/lib/product'

type Props = { product: Product }

export default function VariantSelector({ product }: Props) {
  const {
    colors,
    sizes,
    selectedColor,
    selectedSize,
    setSelectedColor,
    setSelectedSize,
    currentVariant
  } = useProductVariants(product)

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm text-white/70">Cor</h4>
        <div className="flex gap-2 mt-2">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => { setSelectedColor(c); setSelectedSize(null); }}
              aria-pressed={selectedColor === c}
              className={`px-3 py-2 rounded-lg font-medium transition-shadow ${selectedColor === c ? 'bg-amber-500 text-black shadow-md' : 'bg-zinc-800 text-white/80'}`}
            >
              {c[0].toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm text-white/70">Tamanho</h4>
        <div className="flex gap-2 mt-2">
          {sizes.map(s => {
            const existsForColor = !!product.variants.find(v => v.size === s && (!selectedColor || v.color === selectedColor))
            const variantForSize = product.variants.find(v => v.size === s && v.color === selectedColor)
            const disabled = !existsForColor || (variantForSize && variantForSize.stock <= 0)

            return (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                disabled={disabled}
                aria-pressed={selectedSize === s}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${disabled ? 'opacity-40 cursor-not-allowed bg-zinc-700' : selectedSize === s ? 'bg-amber-500 text-black shadow-md' : 'bg-zinc-800 text-white/80'}`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-amber-400">R$ {currentVariant?.price?.toFixed(2)}</span>
          {currentVariant?.stock !== undefined && currentVariant.stock > 0 ? (
            <span className="text-sm text-green-400">Em estoque: {currentVariant.stock}</span>
          ) : (
            <span className="text-sm text-red-400">Indisponível</span>
          )}
        </div>
      </div>
    </div>
  )
}
