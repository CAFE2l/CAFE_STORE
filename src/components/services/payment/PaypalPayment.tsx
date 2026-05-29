'use client';

import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Loader2 } from 'lucide-react';
import type { PaymentPayload } from './types';

type Props = {
  payload: PaymentPayload;
  onSuccess: () => void;
  onToast: (message: string, type?: 'success' | 'error') => void;
};

export function PaypalPayment({ payload, onSuccess, onToast }: Props) {
  if (!payload.paypalClientId) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 text-sm text-zinc-300">
        Configure o Client ID do PayPal para habilitar este metodo.
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId: payload.paypalClientId, currency: 'BRL' }}>
      <PaypalButtonsInner payload={payload} onSuccess={onSuccess} onToast={onToast} />
    </PayPalScriptProvider>
  );
}

function PaypalButtonsInner({ payload, onSuccess, onToast }: Props) {
  const [{ isPending }] = usePayPalScriptReducer();

  return (
    <div className="space-y-4">
      {isPending ? (
        <div className="grid min-h-28 place-items-center rounded-xl bg-zinc-800/50">
          <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
        </div>
      ) : null}

      <PayPalButtons
        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
        createOrder={async () => {
          const response = await fetch('/api/pagamento/paypal/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              valor: payload.amount,
              descricao: payload.description,
              briefingId: payload.briefing.id,
            }),
          });
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Erro ao criar pedido PayPal.');
          }

          return data.orderID;
        }}
        onApprove={async (data) => {
          const response = await fetch('/api/pagamento/paypal/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID }),
          });
          const result = await response.json();

          if (!response.ok) {
            onToast(result.error || 'PayPal recusou o pagamento.', 'error');
            return;
          }

          onSuccess();
        }}
        onError={() => onToast('Nao foi possivel concluir pelo PayPal.', 'error')}
      />
    </div>
  );
}
