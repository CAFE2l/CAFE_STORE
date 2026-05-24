'use client'

import { ImageGallery } from '@/components/ui/ImageGallery'
import { useEffect, useMemo } from 'react'
import { useVariantStore } from '@/lib/variantStore'

export default function ProductGalleryClient({ productId, images, variants, priority = false }: { productId: string; images: Array<{ src: string; alt?: string }>; variants?: any; priority?: boolean }) {
  const selected = useVariantStore((s) => s.getSelected(productId))

  // derive primary variant values (e.g., color) from variants if available
  const variantOptions = Array.isArray(variants) ? variants : []
  const primaryVariantName = variantOptions[0]?.name
  const selectedValue = selected ? selected[primaryVariantName] : undefined

  const grouped = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const img of images) {
      const src = img.src.toLowerCase()
      let matched = false
      for (const opt of variantOptions) {
        for (const val of opt.values) {
          const v = String(val).toLowerCase()
          if (src.includes(v) || src.includes(`/${v}/`)) {
            map[v] = map[v] || []
            map[v].push(img.src)
            matched = true
            break
          }
        }
        if (matched) break
      }
      if (!matched) {
        map['__default'] = map['__default'] || []
        map['__default'].push(img.src)
      }
    }
    return map
  }, [images, variantOptions])

  const imagesToShow = useMemo(() => {
    if (selectedValue) {
      const key = String(selectedValue).toLowerCase()
      if (grouped[key] && grouped[key].length > 0) {
        return grouped[key].map((src, i) => ({ src, alt: `Imagem ${i + 1}` }))
      }
    }
    // fallback: return unique images preserving order, limit to 8
    const uniq: string[] = []
    for (const img of images) {
      if (!uniq.includes(img.src)) uniq.push(img.src)
      if (uniq.length >= 8) break
    }
    return uniq.map((s, i) => ({ src: s, alt: `Imagem ${i + 1}` }))
  }, [grouped, images, selectedValue])

  return <ImageGallery images={imagesToShow as any} priority={priority} />
}
