'use client';

import { CreditCard, Landmark, Wallet } from 'lucide-react';
import type { PaymentMethod } from './types';

const methods: Array<{ value: PaymentMethod; label: string; icon: React.ElementType }> = [
  { value: 'pix', label: 'Pix', icon: Landmark },
  { value: 'mercadopago', label: 'Mercado Pago', icon: CreditCard },
  { value: 'paypal', label: 'PayPal', icon: Wallet },
];

type Props = {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

export function MethodSelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {methods.map((method) => {
        const Icon = method.icon;
        const active = selected === method.value;

        return (
          <button
            key={method.value}
            type="button"
            onClick={() => onChange(method.value)}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              active
                ? 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/50'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{method.label}</span>
            <span className="sm:hidden">{method.value === 'mercadopago' ? 'MP' : method.label}</span>
          </button>
        );
      })}
    </div>
  );
}
