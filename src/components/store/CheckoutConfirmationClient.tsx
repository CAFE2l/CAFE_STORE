'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function CheckoutConfirmationClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');
  const pixPayload = searchParams.get('pix');
  const qrCodeUrl = searchParams.get('qr');
  const pixKey = searchParams.get('pixKey');
  const pixKeyQr = searchParams.get('pixKeyQr');
  const status = searchParams.get('status');
  const collectionStatus = searchParams.get('collection_status');
  const paymentStatus = collectionStatus ?? status;
  const isApproved = !paymentStatus || paymentStatus === 'approved';
  const isPending = paymentStatus === 'pending' || paymentStatus === 'in_process';
  const isFailure = paymentStatus === 'failure' || paymentStatus === 'rejected' || paymentStatus === 'null';
  const [copiedKey, setCopiedKey] = useState(false);

  async function copyPixKey() {
    if (!pixKey) return;
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = pixKey;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <section className="rounded-card border border-border-subtle bg-background-card p-8 text-center animate-scaleIn">
        <div className={`mx-auto grid size-16 place-items-center rounded-full text-3xl ${isApproved ? 'bg-status-success/10' : isPending ? 'bg-yellow-500/10' : 'bg-status-error/10'}`}>
          <span className={isApproved ? 'text-status-success' : isPending ? 'text-yellow-500' : 'text-status-error'}>
            {isApproved ? '✓' : isPending ? '⏳' : '✕'}
          </span>
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold text-text-primary">
          {isApproved
            ? 'Pedido confirmado! 🎉'
            : isPending
              ? 'Pagamento pendente'
              : 'Pagamento nao aprovado'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          {isApproved
            ? orderId
              ? `Pedido #${orderId} foi criado e esta sendo processado.`
              : 'Seu pedido foi criado e esta aguardando processamento.'
            : isPending
              ? 'Seu pagamento esta sendo processado. Assim que for confirmado, seu pedido sera atualizado.'
              : 'Nao foi possivel confirmar seu pagamento. Tente novamente ou escolha outra forma de pagamento.'}
        </p>
        {isApproved ? (
          <p className="mt-1 text-xs text-text-muted">Voce recebera um e-mail de confirmacao em breve.</p>
        ) : null}
      </section>

      {method === 'pix' && pixPayload ? (
        <section className="rounded-card border border-border-subtle bg-background-card p-6">
          <div className="text-center">
            <h2 className="font-display text-xl font-semibold text-text-primary">Pagamento via Pix</h2>
            <p className="mt-1 text-sm text-text-muted">Escaneie o QR Code ou copie a chave Pix abaixo.</p>
          </div>

          {/* QR Code do BR Code completo */}
          {qrCodeUrl ? (
            <div className="relative mx-auto mt-4 aspect-square w-64 overflow-hidden rounded-card border border-border-subtle bg-white p-4">
              <Image src={qrCodeUrl} alt="QR Code Pix" fill sizes="256px" className="object-contain p-4" />
            </div>
          ) : null}

          {/* BR Code copia e cola */}
          <textarea
            className="input-field mt-4 min-h-24 w-full font-mono text-xs"
            readOnly
            value={pixPayload}
            aria-label="Payload Pix copia e cola"
          />

          {/* Chave Pix */}
          {pixKey ? (
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Chave Pix</p>
                  <p className="mt-1 break-all font-mono text-sm text-zinc-300">{pixKey}</p>
                </div>
                <button
                  type="button"
                  onClick={copyPixKey}
                  className={cn(
                    'shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition-all',
                    copiedKey
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white',
                  )}
                >
                  {copiedKey ? '✓ Copiado' : 'Copiar chave'}
                </button>
              </div>
              {pixKeyQr ? (
                <div className="mx-auto mt-4 aspect-square w-48">
                  <Image src={pixKeyQr} alt="QR Code da Chave Pix" width={192} height={192} className="rounded-lg" />
                </div>
              ) : null}
              <p className="mt-3 text-center text-xs text-zinc-600">
                Copie a chave Pix acima, cole no seu banco e efetue o pagamento.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {method === 'mercadopago' && !isApproved ? (
        <section className="rounded-card border border-border-subtle bg-background-card p-6 text-center">
          <Link href="/checkout" className="btn-primary">
            Tentar novamente
          </Link>
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
