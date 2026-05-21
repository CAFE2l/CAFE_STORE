'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function CheckoutConfirmationClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');
  const pixPayload = searchParams.get('pix');
  const qrCodeUrl = searchParams.get('qr');

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <section className="glass animate-fadeUp rounded-2xl p-8 text-center shadow-warm">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-status-success/10 text-3xl text-status-success">
          ✓
        </div>
        <h1 className="mt-5 font-display text-4xl font-semibold text-text-primary">Pedido recebido</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {orderId ? `Pedido ${orderId}` : 'Seu pedido foi criado'} e esta aguardando processamento.
        </p>
      </section>

      {method === 'pix' && pixPayload ? (
        <section className="card grid gap-5 p-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-text-primary">Pagamento Pix</h2>
            <p className="mt-2 text-sm text-text-secondary">Use o QR Code ou copie o payload Pix abaixo.</p>
          </div>
          {qrCodeUrl ? (
            <div className="relative mx-auto aspect-square w-72 overflow-hidden rounded-2xl bg-white p-4">
              <Image src={qrCodeUrl} alt="QR Code Pix" fill sizes="288px" className="object-contain p-4" />
            </div>
          ) : null}
          <textarea
            className="input-field min-h-32 w-full font-mono text-xs"
            readOnly
            value={pixPayload}
            aria-label="Payload Pix copia e cola"
          />
        </section>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/orders" className="btn-primary">
          Ver pedidos
        </Link>
        <Link href="/products" className="btn-secondary">
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
