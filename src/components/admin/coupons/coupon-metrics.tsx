import { Gift, Percent, TimerOff, TrendingUp } from 'lucide-react';
import MetricCard from '@/components/admin/MetricCard';

type Metrics = {
  total: number;
  active: number;
  expired: number;
  totalUsages: number;
};

export function CouponMetrics({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total de cupons"
        value={metrics.total}
        subtitle="Cupons cadastrados"
        icon={Gift}
        tone="orange"
      />
      <MetricCard
        title="Cupons ativos"
        value={metrics.active}
        subtitle="Disponíveis para uso"
        icon={Percent}
        tone="orange"
      />
      <MetricCard
        title="Cupons expirados"
        value={metrics.expired}
        subtitle="Fora da validade"
        icon={TimerOff}
        tone={metrics.expired > 0 ? 'red' : 'neutral'}
        trend={metrics.expired > 0 ? 'down' : 'up'}
      />
      <MetricCard
        title="Usos totais"
        value={metrics.totalUsages}
        subtitle="Vezes que cupons foram usados"
        icon={TrendingUp}
        tone={metrics.totalUsages > 0 ? 'orange' : 'neutral'}
      />
    </div>
  );
}
