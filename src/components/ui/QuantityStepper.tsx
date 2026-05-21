'use client';

import { cn } from '@/lib/utils';

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
        'inline-grid h-11 grid-cols-[2.75rem_3.5rem_2.75rem] overflow-hidden rounded-xl border border-white/10 bg-background-surface',
        className,
      )}
    >
      <button
        type="button"
        className="grid place-items-center text-lg text-text-secondary transition hover:bg-background-card hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Diminuir quantidade"
        disabled={!canDecrease}
        onClick={() => onChange(currentValue - 1)}
      >
        -
      </button>
      <output className="grid place-items-center border-x border-white/10 text-sm font-semibold text-text-primary">
        {currentValue}
      </output>
      <button
        type="button"
        className="grid place-items-center text-lg text-text-secondary transition hover:bg-background-card hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Aumentar quantidade"
        disabled={!canIncrease}
        onClick={() => onChange(currentValue + 1)}
      >
        +
      </button>
    </div>
  );
}
