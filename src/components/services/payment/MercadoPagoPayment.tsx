'use client';

import { useEffect, useState } from 'react';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { Loader2 } from 'lucide-react';
import type { TPaymentType } from '@mercadopago/sdk-react/esm/bricks/payment/type';
import type { PaymentPayload } from './types';

type Props = {
  payload: PaymentPayload;
  onSuccess: () => void;
  onToast: (message: string, type?: 'success' | 'error') => void;
};

export function MercadoPagoPayment({ payload, onSuccess, onToast }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!payload.mpPublicKey) return;
    initMercadoPago(payload.mpPublicKey, { locale: 'pt-BR' });
    setReady(true);
  }, [payload.mpPublicKey]);

  if (!payload.mpPublicKey) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 text-sm text-zinc-300">
        Configure a chave publica do Mercado Pago para habilitar cartao.
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="grid min-h-48 place-items-center rounded-xl bg-zinc-800/50">
        <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
      </div>
    );
  }

  const initialization = {
    amount: payload.amount,
    preferenceId: undefined,
  } satisfies TPaymentType['initialization'];

  const customization = {
    paymentMethods: {
      creditCard: 'all',
      debitCard: 'all',
      mercadoPago: 'all',
    },
    visual: {
      style: {
        theme: 'dark',
      },
    },
  } satisfies TPaymentType['customization'];

  return (
    <div className="space-y-3">
      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={async (formData) => {
          const response = await fetch('/api/pagamento/cartao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              valor: payload.amount,
              descricao: payload.description,
              email: payload.briefing.email,
              briefingId: payload.briefing.id,
              formData,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            onToast(data.error || 'Pagamento recusado.', 'error');
            throw new Error(data.error || 'Pagamento recusado.');
          }

          if (data.status === 'approved') {
            onSuccess();
            return;
          }

          onToast('Pagamento recebido para analise. Aguarde a confirmacao.', 'success');
        }}
        onError={() => onToast('Erro ao carregar o Checkout Brick.', 'error')}
        locale="pt-BR"
      />
    </div>
  );
}
