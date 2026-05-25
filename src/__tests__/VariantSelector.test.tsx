import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import VariantSelector from '@/components/ProductPage/VariantSelector'
import { mockProduct } from '@/lib/product'

test('VariantSelector updates selection', () => {
  render(<VariantSelector product={mockProduct} />)

  const blackBtn = screen.getByRole('button', { name: /preta/i })
  fireEvent.click(blackBtn)
  expect(blackBtn).toHaveAttribute('aria-pressed', 'true')

  const sizeP = screen.getByRole('button', { name: /P/i })
  fireEvent.click(sizeP)
  expect(sizeP).toHaveAttribute('aria-pressed', 'true')
})
