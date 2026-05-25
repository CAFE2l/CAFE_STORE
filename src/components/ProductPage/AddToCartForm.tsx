'use client'

import React, { useState } from 'react'
import { useProductVariants } from '@/hooks/useProductVariants'
import type { Product } from '@/lib/product'

type Props = { product: Product }

export default function AddToCartForm({ product }: Props) {
  const { currentVariant, isAddToCartEnabled } = useProductVariants(product)
  const [qty, setQty] = useState(1)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!isAddToCartEnabled) return
        console.log('add to cart', { sku: currentVariant?.sku, qty })
      }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <label className="text-sm text-white/70">Quantidade</label>
        <input
          type="number"
          min={1}
          max={currentVariant?.stock ?? 1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-20 bg-zinc-900 rounded-md px-2 py-1 text-white"
        />
      </div>

      <button
        type="submit"
        disabled={!isAddToCartEnabled}
        className={`w-full py-3 rounded-lg text-white font-bold transition-all ${isAddToCartEnabled ? 'bg-amber-500 hover:brightness-110 shadow-lg' : 'bg-zinc-700 opacity-60 cursor-not-allowed'}`}
        aria-disabled={!isAddToCartEnabled}
        aria-label="Adicionar ao carrinho"
      >
        {isAddToCartEnabled ? 'Adicionar ao carrinho' : 'Selecione cor e tamanho'}
      </button>
    </form>
  )
}
