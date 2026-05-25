import type { NextApiRequest, NextApiResponse } from 'next'
import { mockProduct } from '@/lib/product'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  if (slug === mockProduct.slug) {
    return res.status(200).json({ product: mockProduct })
  }
  return res.status(404).json({ error: 'Not found' })
}
