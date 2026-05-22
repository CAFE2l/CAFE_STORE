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
        'inline-grid h-11 grid-cols-[2.75rem_3rem_2.75rem] overflow-hidden rounded-button border border-border-subtle bg-background-card',
        className,
      )}
    >
      <button
        type="button"
        className="grid place-items-center text-lg text-text-secondary transition duration-200 hover:bg-cafe-red-500/10 hover:text-cafe-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Diminuir quantidade"
        disabled={!canDecrease}
        onClick={() => onChange(currentValue - 1)}
      >
        <Minus className="h-4 w-4" />
      </button>
      <output className="grid place-items-center border-x border-border-subtle text-sm font-semibold text-text-primary">
        {currentValue}
      </output>
      <button
        type="button"
        className="grid place-items-center text-lg text-text-secondary transition duration-200 hover:bg-cafe-red-500/10 hover:text-cafe-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Aumentar quantidade"
        disabled={!canIncrease}
        onClick={() => onChange(currentValue + 1)}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
