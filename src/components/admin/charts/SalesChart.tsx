'use client'

import React from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function SalesChart({ data }: { data: { label: string; revenue: number; orders: number }[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.42} />
              <stop offset="70%" stopColor="#dc2626" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `R$ ${value}`} />
          <Tooltip
            cursor={{ stroke: 'rgba(249,115,22,0.35)', strokeWidth: 1 }}
            contentStyle={{ background: '#090909', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff' }}
            formatter={(value, name) => [name === 'revenue' ? `R$ ${Number(value).toFixed(2)}` : value, name === 'revenue' ? 'Receita' : 'Pedidos']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fill="url(#salesGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function OrderStatusChart({ data }: { data: { status: string; total: number }[] }) {
  const colors = ['#f97316', '#ef4444', '#facc15', '#22c55e', '#38bdf8'];

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart key="order-status-chart" data={data} margin={{ left: 0, right: 0, top: 16, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="status" stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            isAnimationActive={false}
            contentStyle={{ background: '#090909', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff' }}
          />
          <Bar dataKey="total" radius={[8, 8, 0, 0]} isAnimationActive={false}>
            {data.map((item, index) => (
              <Cell key={item.status} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
