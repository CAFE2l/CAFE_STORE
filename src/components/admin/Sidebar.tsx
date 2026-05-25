'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Boxes, ChevronLeft, ChevronRight, Gift, Image, LayoutDashboard, MessageSquareText, Settings, ShoppingBag, Star, Tags, Users } from 'lucide-react'

const NAV = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Produtos', href: '/admin/produtos', icon: Boxes },
  { title: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
  { title: 'Usuários', href: '/admin/usuarios', icon: Users },
  { title: 'Categorias', href: '/admin/categorias', icon: Tags },
  { title: 'Cupons', href: '/admin/cupons', icon: Gift },
  { title: 'Avaliações', href: '/admin/avaliacoes', icon: Star },
  { title: 'Feedbacks', href: '/admin/feedbacks', icon: MessageSquareText },
  { title: 'Banners', href: '/admin/banners', icon: Image },
  { title: 'Configurações', href: '/admin/configuracoes', icon: Settings }
]

export default function Sidebar({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const path = usePathname()

  return (
    <aside className={`sticky top-0 h-screen border-r border-white/10 bg-black/60 p-3 backdrop-blur-xl transition-all duration-300 ${collapsed ? 'w-[86px]' : 'w-[292px]'}`}>
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400 text-xs font-black text-black shadow-led-brand">CS</div>
          {!collapsed && (
            <div>
              <div className="text-sm font-black tracking-wide text-white">CAFÉ STORE</div>
              <div className="text-[11px] text-zinc-500">Commerce OS</div>
            </div>
          )}
        </div>
        <button aria-label="Alternar sidebar" onClick={onToggle} className="hidden h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black/30 text-zinc-400 transition hover:text-white lg:grid">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="mt-5 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = path === item.href || path?.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={`group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-orange-500/20 to-red-500/10 text-white shadow-[inset_3px_0_0_#f97316]'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-orange-300' : 'text-zinc-500 group-hover:text-orange-300'}`} />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="absolute inset-x-3 bottom-3">
        {!collapsed && (
          <div className="rounded-xl border border-orange-400/20 bg-orange-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-orange-100">
              <BarChart3 className="h-4 w-4" />
              Operação em tempo real
            </div>
            <p className="mt-2 text-xs leading-5 text-orange-100/60">Métricas vindas do PostgreSQL via Prisma.</p>
          </div>
        )}
      </div>
    </aside>
  )
}
