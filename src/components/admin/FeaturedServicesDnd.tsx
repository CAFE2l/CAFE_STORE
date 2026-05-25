'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from './SortableItem'
import { Grip } from 'lucide-react'

export function FeaturedServicesDnd({ initial }: { initial: Array<{ id: string; authorName: string; authorAvatarUrl?: string | null; rating?: number; title?: string }>} ) {
  const [items, setItems] = useState(initial.map(i => i.id))
  const [list, setList] = useState(initial)

  useEffect(() => {
    setItems(initial.map(i => i.id))
    setList(initial)
  }, [initial])

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over) return
    const oldIndex = items.indexOf(active.id)
    const newIndex = items.indexOf(over.id)
    if (oldIndex !== newIndex) {
      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      // reorder list accordingly
      const newList = newItems.map(id => list.find(l => l.id === id)!).filter(Boolean)
      setList(newList)
      // send to server
      fetch('/api/admin/feedbacks/reorder-services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newItems }),
      }).catch(() => null)
    }
  }

  async function handleRemove(id: string) {
    // Unfeature
    await fetch(`/api/admin/feedbacks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isFeaturedServices: false }) })
    const newList = list.filter(l => l.id !== id)
    setList(newList)
    setItems(newList.map(n => n.id))
  }

  if (list.length === 0) return (
    <div className="glass-card p-6 mb-8">
      <p className="text-white/25 text-sm text-center py-6">Nenhum depoimento destacado ainda. Ative o toggle em qualquer feedback aprovado abaixo.</p>
    </div>
  )

  return (
    <div className="glass-card p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-medium">Destaques na página de Serviços</h2>
          <p className="text-white/40 text-xs mt-1">Arraste para reordenar • máximo recomendado: 6 depoimentos</p>
        </div>
        <span className="text-brand text-sm font-mono">{list.length}/6</span>
      </div>

      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {list.map((fb, i) => (
            <SortableItem key={fb.id} id={fb.id}>
              <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-2">
                <Grip className="text-white/20 cursor-grab" />
                <span className="text-brand font-mono text-sm w-4">{i + 1}</span>
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-white/10">
                  {fb.authorAvatarUrl ? (
                    <Image src={fb.authorAvatarUrl} alt="" fill sizes="32px" className="object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{fb.authorName}</p>
                  <p className="text-white/40 text-xs truncate">&ldquo;{fb.title || ''}&rdquo;</p>
                </div>
                <button onClick={() => handleRemove(fb.id)} className="text-white/20 hover:text-red-400 transition-colors">
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
