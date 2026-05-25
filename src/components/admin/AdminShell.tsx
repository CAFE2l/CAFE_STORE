'use client'

import React, { useState } from 'react'
import Sidebar from './Sidebar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-[#0b0b0b] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-[auto_1fr] gap-8">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
        <main className="bg-black/30 backdrop-blur-md rounded-2xl p-6 shadow-soft">{children}</main>
      </div>
    </div>
  )
}
