import { renderHook, act } from '@testing-library/react'
import { useProductVariants } from '@/hooks/useProductVariants'
import { mockProduct } from '@/lib/product'

describe('useProductVariants', () => {
  test('filters images by color and size', () => {
    const { result } = renderHook(() => useProductVariants(mockProduct))

    act(() => {
      result.current.setSelectedColor('preta')
    })
    expect(result.current.images.every(src => src.includes('black'))).toBe(true)

    act(() => {
      result.current.setSelectedSize('P')
    })
    expect(result.current.currentVariant?.sku).toBe('CAF-001-BLK-P')
    expect(result.current.isAddToCartEnabled).toBe(true)
  })
})
