'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, BarChart3, Boxes, ChevronLeft, ChevronRight, ClipboardList, Gift, Image, LayoutDashboard, MessageSquareText, Settings, ShoppingBag, Star, Tags, Users } from 'lucide-react'
import { BrandLogo } from './BrandLogo'

const NAV = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Produtos', href: '/admin/produtos', icon: Boxes },
  { title: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
  { title: 'Usuários', href: '/admin/usuarios', icon: Users },
  { title: 'Categorias', href: '/admin/categorias', icon: Tags },
  { title: 'Cupons', href: '/admin/cupons', icon: Gift },
  { title: 'Avaliações', href: '/admin/avaliacoes', icon: Star },
  { title: 'Feedbacks', href: '/admin/feedbacks', icon: MessageSquareText },
  { title: 'Briefings', href: '/admin/briefings', icon: ClipboardList },
  { title: 'Banners', href: '/admin/banners', icon: Image }
]

const FOOTER_NAV = [
  { title: 'Configurações', href: '/admin/configuracoes', icon: Settings },
  { title: 'Voltar para loja', href: '/', icon: ArrowLeft }
]

export default function Sidebar({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const path = usePathname()

  return (
    <aside className={`sticky top-0 z-20 flex h-screen shrink-0 flex-col border-r border-white/10 bg-black/60 p-3 backdrop-blur-xl transition-all duration-300 ${collapsed ? 'w-[86px]' : 'w-[292px]'}`}>
      <div className="shrink-0">
        <div className="flex min-h-[62px] items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
          <div className="flex items-center gap-3">
            <BrandLogo size={40} />
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
      </div>

      <nav className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(249,115,22,0.45)_transparent]">
        <div className="flex flex-col gap-1 pb-3">
        {NAV.map((item) => {
          const active = path === item.href || path?.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={`group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all ${
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
        </div>
      </nav>

      <footer className="mt-3 shrink-0 border-t border-white/10 pt-3">
        <div className="flex flex-col gap-1">
          {FOOTER_NAV.map((item) => {
            const active = path === item.href || path?.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-orange-500/20 to-red-500/10 text-white shadow-[inset_3px_0_0_#f97316]'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                }`}
                title={collapsed ? item.title : undefined}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-orange-300' : 'text-zinc-500 group-hover:text-orange-300'}`} />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            )
          })}
        </div>
        {!collapsed && (
          <div className="mt-2 rounded-xl border border-orange-400/20 bg-orange-500/10 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-100">
              <BarChart3 className="h-4 w-4" />
              Operação em tempo real
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-orange-100/60">Dados reais do PostgreSQL.</p>
          </div>
        )}
      </footer>
    </aside>
  )
}
