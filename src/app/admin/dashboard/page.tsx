import React from 'react'
import prisma from '@/lib/prisma'
import MetricCard from '@/components/admin/MetricCard'
import SalesChart from '@/components/admin/charts/SalesChart'

export default async function DashboardPage() {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)

  const ordersToday = await prisma.order.count({ where: { createdAt: { gte: startOfToday } } })
  const salesTodayAgg = await prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfToday } } })
  const salesToday = salesTodayAgg._sum.total ?? 0

  const usersCount = await prisma.user.count()
  const productsCount = await prisma.product.count({ where: { active: true } })

  const revenueRaw: any[] = await prisma.$queryRawUnsafe(`
    SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day, SUM(total) as revenue
    FROM "Order"
    WHERE "createdAt" >= '${thirtyDaysAgo.toISOString()}'
    GROUP BY day ORDER BY day ASC
  `)

  const chartData = revenueRaw.map((r) => ({ date: r.day, revenue: Number(r.revenue) }))
  const recentOrders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { user: true } })

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-white/60">Resumo das métricas em tempo real</div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Vendas hoje" value={`R$ ${salesToday.toFixed(2)}`} subtitle={`${ordersToday} pedidos`} />
        <MetricCard title="Pedidos hoje" value={ordersToday} />
        <MetricCard title="Usuários" value={usersCount} />
        <MetricCard title="Produtos ativos" value={productsCount} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-medium mb-3">Receita (últimos 30 dias)</h2>
          {/* @ts-expect-error server->client */}
          <SalesChart data={chartData} />
        </div>

        <div>
          <h2 className="text-lg font-medium mb-3">Pedidos recentes</h2>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="p-3 bg-black/20 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Pedido {o.id}</div>
                    <div className="text-sm text-white/60">{o.user?.email ?? '—'}</div>
                  </div>
                  <div className="text-sm">R$ {o.total.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
