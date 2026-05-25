import React from 'react'
import ProductGallery from '@/components/ProductPage/ProductGallery'
import VariantSelector from '@/components/ProductPage/VariantSelector'
import AddToCartForm from '@/components/ProductPage/AddToCartForm'
import type { Product } from '@/lib/product'

export default function ProductPage({ product }: { product: Product }) {
  if (!product) return <div>Produto não encontrado</div>

  return (
    <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section>
        <ProductGallery images={product.variants.find(v=>v.color===product.variants[0].color)?.images ?? []} />
      </section>

      <aside>
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <p className="mt-2 text-sm text-white/70">{product.description}</p>

        <div className="mt-6 space-y-6">
          <VariantSelector product={product} />
          <AddToCartForm product={product} />
        </div>
      </aside>
    </main>
  )
}

export async function getServerSideProps(context: any) {
  const { slug } = context.params
  const proto = context.req.headers['x-forwarded-proto'] || 'http'
  const host = context.req.headers.host
  const url = `${proto}://${host}/api/products/${slug}`

  try {
    const res = await fetch(url)
    if (!res.ok) return { notFound: true }
    const data = await res.json()
    return { props: { product: data.product } }
  } catch (err) {
    console.error('fetch product error', err)
    return { notFound: true }
  }
}
