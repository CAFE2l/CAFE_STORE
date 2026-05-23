'use client';

import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export function QuantityStepper({
  className,
  max,
  min = 1,
  onChange,
  value,
}: QuantityStepperProps) {
  const currentValue = Math.max(min, value);
  const canDecrease = currentValue > min;
  const canIncrease = typeof max === 'number' ? currentValue < max : true;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3',
        className,
      )}
    >
      <button
        type="button"
        className="flex size-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 transition-all duration-200 hover:border-cafe-orange-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Diminuir quantidade"
        disabled={!canDecrease}
        onClick={() => onChange(currentValue - 1)}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-lg font-semibold text-white">
        {currentValue}
      </span>
      <button
        type="button"
        className="flex size-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 transition-all duration-200 hover:border-cafe-orange-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Aumentar quantidade"
        disabled={!canIncrease}
        onClick={() => onChange(currentValue + 1)}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
