import React from 'react'

export default function MetricCard({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-white/2 to-white/3 p-4 rounded-xl shadow-md flex items-start gap-4">
      <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center text-black font-bold">{icon ?? '⚡'}</div>
      <div className="flex-1">
        <div className="text-sm text-white/70">{title}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        {subtitle && <div className="text-xs text-white/50 mt-1">{subtitle}</div>}
      </div>
    </div>
  )
}
