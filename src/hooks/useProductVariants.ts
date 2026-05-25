import { useMemo, useState } from 'react'
import type { Product, Variant } from '@/lib/product'

export function useProductVariants(product: Product) {
  const colors = useMemo(() => {
    const set = new Set(product.variants.map(v => v.color))
    return Array.from(set)
  }, [product])

  const sizes = useMemo(() => {
    const set = new Set(product.variants.map(v => v.size))
    return Array.from(set)
  }, [product])

  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const filteredVariants = useMemo(() => {
    return product.variants.filter(v => (selectedColor ? v.color === selectedColor : true) && (selectedSize ? v.size === selectedSize : true))
  }, [product, selectedColor, selectedSize])

  const images = useMemo(() => {
    // If both color and size selected prefer exact variant images
    if (selectedColor && selectedSize) {
      const exact = product.variants.find(v => v.color === selectedColor && v.size === selectedSize)
      if (exact) return exact.images
    }
    // If only color selected, return images from that color (unique, preserve order)
    if (selectedColor) {
      const imgs: string[] = []
      for (const v of product.variants) {
        if (v.color !== selectedColor) continue
        for (const img of v.images) if (!imgs.includes(img)) imgs.push(img)
      }
      return imgs
    }
    // fallback: all unique images
    const all: string[] = []
    for (const v of product.variants) for (const img of v.images) if (!all.includes(img)) all.push(img)
    return all
  }, [product, selectedColor, selectedSize])

  const currentVariant = useMemo<Variant | undefined>(() => {
    if (selectedColor && selectedSize) {
      return product.variants.find(v => v.color === selectedColor && v.size === selectedSize)
    }
    if (selectedColor) {
      return product.variants.find(v => v.color === selectedColor && v.stock > 0) ?? product.variants.find(v => v.color === selectedColor)
    }
    return product.variants[0]
  }, [product, selectedColor, selectedSize])

  const isAddToCartEnabled = !!currentVariant && currentVariant.stock > 0 && !!selectedSize

  return {
    colors,
    sizes,
    selectedColor,
    selectedSize,
    setSelectedColor,
    setSelectedSize,
    filteredVariants,
    images,
    currentVariant,
    isAddToCartEnabled
  }
}
