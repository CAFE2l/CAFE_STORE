'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useState } from 'react'

type Props = { images: string[]; alt?: string }

export default function ProductGallery({ images, alt = 'product image' }: Props) {
  const [index, setIndex] = useState(0)
  if (!images || images.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-[520px] rounded-xl overflow-hidden bg-black/30 backdrop-blur-md shadow-soft">
        <AnimatePresence mode="wait">
          <motion.div
            key={images[index]}
            initial={{ opacity: 0, x: 20, scale: 0.99 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.99 }}
            transition={{ duration: 0.35 }}
            className="w-full h-full"
          >
            <Image src={images[index]} alt={`${alt}-${index}`} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 520px" priority={index===0} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3 overflow-x-auto">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setIndex(i)}
            aria-pressed={i === index}
            aria-label={`Visualizar imagem ${i + 1}`}
            className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${i === index ? 'border-amber-400 ring-2 ring-amber-500/30' : 'border-transparent opacity-60'} focus:outline-none focus-visible:ring-2`}
          >
            <Image src={src} alt={`thumb-${i}`} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  )
}
