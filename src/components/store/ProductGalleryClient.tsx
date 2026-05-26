'use client'

import { ImageGallery } from '@/components/ui/ImageGallery'
import { useMemo } from 'react'
import { useVariantStore } from '@/lib/variantStore'

type ProductGalleryImage = {
  src: string
  alt?: string
  label?: string
}

type VariantOption = {
  name: string
  values: string[]
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function parseVariants(variants: unknown): VariantOption[] {
  if (!Array.isArray(variants)) return []
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
          values: (variant.values as unknown[]).filter((value): value is string => typeof value === 'string'),
        }
      }
      return null
    })
    .filter((variant): variant is VariantOption => Boolean(variant))
}

export default function ProductGalleryClient({
  productId,
  images,
  variants,
  priority = false,
}: {
  productId: string
  images: ProductGalleryImage[]
  variants?: unknown
  priority?: boolean
}) {
  const selected = useVariantStore((s) => s.getSelected(productId))

  const variantOptions = useMemo(() => parseVariants(variants), [variants])
  const colorOption = useMemo(
    () => variantOptions.find((option) => normalize(option.name) === 'cor'),
    [variantOptions],
  )
  const defaultColor = useMemo(() => {
    if (!colorOption) return null
    return colorOption.values.find((value) => normalize(value) === 'preta') ?? colorOption.values[0] ?? null
  }, [colorOption])
  const selectedColor = colorOption ? selected?.[colorOption.name] ?? defaultColor : null

  const grouped = useMemo(() => {
    const map: Record<string, ProductGalleryImage[]> = {}
    const colors = colorOption?.values ?? []

    for (const img of images) {
      const src = normalize(img.src)
      const alt = normalize(img.alt ?? '')
      let matched = false

      for (const color of colors) {
        const key = normalize(color)
        if (
          src.includes(`/${key}/`) ||
          src.includes(`-${key}-`) ||
          src.includes(`_${key}_`) ||
          src.includes(`${key}.`) ||
          alt.includes(`cor:${key}`) ||
          alt.includes(`cor ${key}`)
        ) {
          map[key] = map[key] || []
          map[key].push(img)
          matched = true
          break
        }
      }

      if (!matched) {
        map['__default'] = map['__default'] || []
        map['__default'].push(img)
      }
    }

    return map
  }, [colorOption, images])

  const imagesToShow = useMemo(() => {
    if (selectedColor) {
      const key = normalize(selectedColor)
      if (grouped[key] && grouped[key].length > 0) {
        return grouped[key].map((image, index) => ({
          ...image,
          alt: image.alt ?? `${selectedColor} - imagem ${index + 1}`,
        }))
      }
    }

    const uniq: ProductGalleryImage[] = []
    const seen = new Set<string>()
    for (const img of images) {
      if (seen.has(img.src)) continue
      seen.add(img.src)
      uniq.push(img)
    }
    return uniq.map((image, index) => ({ ...image, alt: image.alt ?? `Imagem ${index + 1}` }))
  }, [grouped, images, selectedColor])

  return <ImageGallery images={imagesToShow} priority={priority} />
}
