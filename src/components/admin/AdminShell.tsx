'use client'

import { useState } from 'react'
import { Menu, Search, ShieldCheck, X } from 'lucide-react'
import Sidebar from './Sidebar'
import { BrandLogo } from './BrandLogo'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(249,115,22,0.16),transparent_28%),radial-gradient(circle_at_82%_4%,rgba(192,57,43,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_35%)]" />
      <div className="relative flex min-h-screen">
        <div className="hidden shrink-0 lg:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />
            <div className="relative h-full w-[310px]">
              <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-black/55 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] lg:hidden"
                aria-label="Abrir menu"
                onClick={() => setMobileOpen(true)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <label className="relative hidden min-w-0 flex-1 md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  className="h-10 w-full max-w-xl rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-400/60"
                  placeholder="Buscar produtos, pedidos, clientes..."
                />
              </label>
              <div className="ml-auto flex items-center gap-3">
                <span className="hidden items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs font-medium text-orange-200 sm:flex">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin seguro
                </span>
                <BrandLogo size={40} />
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
