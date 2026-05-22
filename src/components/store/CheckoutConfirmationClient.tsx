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
      <section className="rounded-card border border-border-subtle bg-background-card p-8 text-center animate-scaleIn">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-status-success/10 text-3xl">
          <span className="text-status-success">✓</span>
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold text-text-primary">Pedido confirmado! 🎉</h1>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          {orderId ? `Pedido #${orderId}` : 'Seu pedido'} foi criado e está aguardando processamento.
        </p>
        <p className="mt-1 text-xs text-text-muted">Você receberá um e-mail de confirmação em breve.</p>
      </section>

      {method === 'pix' && pixPayload ? (
        <section className="rounded-card border border-border-subtle bg-background-card p-6">
          <div className="text-center">
            <h2 className="font-display text-xl font-semibold text-text-primary">Pagamento via Pix</h2>
            <p className="mt-1 text-sm text-text-muted">Escaneie o QR Code ou copie o código abaixo.</p>
          </div>
          {qrCodeUrl ? (
            <div className="relative mx-auto mt-4 aspect-square w-64 overflow-hidden rounded-card border border-border-subtle bg-white p-4">
              <Image src={qrCodeUrl} alt="QR Code Pix" fill sizes="256px" className="object-contain p-4" />
            </div>
          ) : null}
          <textarea
            className="input-field mt-4 min-h-24 w-full font-mono text-xs"
            readOnly
            value={pixPayload}
            aria-label="Payload Pix copia e cola"
          />
        </section>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/orders" className="btn-primary">
          Acompanhar pedido
        </Link>
        <Link href="/products" className="btn-secondary">
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
