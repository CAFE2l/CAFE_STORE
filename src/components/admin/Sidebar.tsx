'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Box, FileText, Users, Tag, Gift, Star, Image, Settings } from 'lucide-react'
import React from 'react'

const NAV = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { title: 'Produtos', href: '/admin/produtos', icon: Box },
  { title: 'Pedidos', href: '/admin/pedidos', icon: FileText },
  { title: 'Usuários', href: '/admin/usuarios', icon: Users },
  { title: 'Categorias', href: '/admin/categorias', icon: Tag },
  { title: 'Cupons', href: '/admin/cupons', icon: Gift },
  { title: 'Avaliações', href: '/admin/avaliacoes', icon: Star },
  { title: 'Feedbacks', href: '/admin/feedbacks', icon: Image },
  { title: 'Banners', href: '/admin/banners', icon: Image },
  { title: 'Configurações', href: '/admin/configuracoes', icon: Settings }
]

export default function Sidebar({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const path = usePathname()

  return (
    <aside className={`bg-black/40 backdrop-blur-md p-4 rounded-2xl transition-all duration-200 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black">CAFÉ</div>
          {!collapsed && <div className="text-white font-semibold">CAFÉ STORE</div>}
        </div>
        <button aria-label="Toggle sidebar" onClick={onToggle} className="p-2 rounded-md bg-white/6">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = path?.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${active ? 'bg-amber-600/20 text-amber-400' : 'text-white/80 hover:bg-white/5'}`}>
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="mt-6 text-sm text-white/60">
        {!collapsed && <div>Modo Admin • <span className="text-amber-400">Premium</span></div>}
      </div>
    </aside>
  )
}
