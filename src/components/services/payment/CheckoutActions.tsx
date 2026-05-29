'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { WhatsappIcon } from '@/components/ui/WhatsappIcon';
import { PaymentModal } from './PaymentModal';
import type { PaymentPayload } from './types';

type Props = {
  whatsappHref: string;
  payment: PaymentPayload;
};

export function CheckoutActions({ whatsappHref, payment }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-brand/40 bg-brand/10 px-6 text-sm font-semibold text-brand transition-all duration-300 hover:bg-brand hover:text-white hover:shadow-led-brand"
        >
          <WhatsappIcon className="h-5 w-5 shrink-0" />
          Falar no WhatsApp
        </a>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500 px-6 text-sm font-bold text-white shadow-led-brand transition-all duration-300 hover:bg-orange-400 hover:shadow-[0_0_30px_8px_rgba(249,115,22,0.25)] active:scale-[0.98]"
        >
          <CreditCard className="h-5 w-5" />
          Finalizar solicitação
        </button>
      </div>

      <PaymentModal open={open} onClose={() => setOpen(false)} payload={payment} />
    </>
  );
}
