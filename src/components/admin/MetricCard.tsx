import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  tone?: 'orange' | 'red' | 'yellow' | 'neutral';
  trend?: 'up' | 'down';
};

const tones = {
  orange: 'from-orange-500/20 text-orange-300',
  red: 'from-red-500/20 text-red-300',
  yellow: 'from-yellow-400/20 text-yellow-200',
  neutral: 'from-white/10 text-zinc-200',
};

export default function MetricCard({ title, value, subtitle, icon: Icon, tone = 'orange', trend = 'up' }: MetricCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-card backdrop-blur transition hover:border-orange-400/30">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">{title}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-white">{value}</p>
        </div>
        <span className={cn('grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br to-transparent', tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">
        <TrendIcon className={cn('h-3.5 w-3.5', trend === 'up' ? 'text-emerald-300' : 'text-red-300')} />
        {subtitle}
      </p>
    </article>
  );
}

