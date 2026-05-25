'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, ShoppingCart, Users, Tag, Percent, Star, MessageCircle, ClipboardList, Image, BarChart, ArrowLeft } from 'lucide-react'
import React from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/produtos', label: 'Produtos', icon: Package, badgeKey: 'products' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart, badgeKey: 'orders' },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users, badgeKey: 'users' },
  { href: '/admin/categorias', label: 'Categorias', icon: Tag },
  { href: '/admin/cupons', label: 'Cupons', icon: Percent },
  { href: '/admin/avaliacoes', label: 'Avaliações', icon: Star, badgeKey: 'reviews' },
  { href: '/admin/feedbacks', label: 'Feedbacks', icon: MessageCircle, badgeKey: 'feedbacks' },
  { href: '/admin/briefings', label: 'Briefings', icon: ClipboardList },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart },
]

export function AdminSidebar() {
  const pathname = usePathname() ?? '/admin'

  // Placeholder counts — can be replaced by real API calls later
  const [counts] = React.useState<Record<string, number>>({ products: 0, orders: 0, users: 0, reviews: 0, feedbacks: 0 })

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 p-6 gap-6 bg-[#070707]/60 admin-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand/15 flex items-center justify-center text-brand shadow-led-sm">☕</div>
        <div>
          <Link href="/admin" className="text-white font-semibold">CAFÉ STORE</Link>
          <div className="text-xs text-white/40">Painel de administração</div>
        </div>
      </div>

      <nav className="flex-1 overflow-auto">
        <ul className="flex flex-col gap-2">
          {navItems.map((item) => {
            const ActiveIcon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${isActive ? 'bg-brand text-black shadow-led-sm' : 'text-white/70 hover:bg-white/[0.03] hover:text-white'}`}>
                  <span className={`p-2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'text-white/40'}`}>
                    <ActiveIcon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                  {item.badgeKey ? (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${isActive ? 'bg-black/50 text-brand' : 'bg-white/6 text-white/60'}`}>
                      {counts[item.badgeKey] ?? 0}
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-auto">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl admin-btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar para loja</span>
        </Link>
      </div>
    </aside>
  )
}

export default AdminSidebar
