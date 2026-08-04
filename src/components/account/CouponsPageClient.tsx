'use client';

import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { EmptyPanel, currencyFormatter } from './shared';

type CouponItem = {
  code: string;
  discount_type: 'percent' | 'fixed';
  value: number;
  expires_at: string | null;
  is_used: boolean;
  min_order_value: number | null;
  active: boolean;
};

export function CouponsPageClient() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [showOld, setShowOld] = useState(true);

  async function load() {
    const response = await fetch('/api/user/coupons');
    const json = await response.json();
    setCoupons(json.data ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function verify() {
    setError('');
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const json = await response.json();
    if (!json.success) {
      setError(json.error ?? 'Cupom invalido.');
      return;
    }
    await load();
    setCode('');
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(''), 2000);
  }

  const available = coupons.filter((coupon) => coupon.active && !coupon.is_used && (!coupon.expires_at || new Date(coupon.expires_at) >= new Date()));
  const old = coupons.filter((coupon) => !available.includes(coupon));

  function CouponCard({ coupon }: { coupon: CouponItem }) {
    const expired = Boolean(coupon.expires_at && new Date(coupon.expires_at) < new Date());
    const disabled = coupon.is_used || expired || !coupon.active;
    const status = coupon.is_used ? 'Usado' : expired || !coupon.active ? 'Expirado' : 'Disponivel';
    return (
      <article className={cn('rounded-2xl border bg-zinc-900/40 p-5', disabled ? 'border-white/[0.06] border-l-zinc-600' : 'border-white/[0.06] border-l-brand')}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-2xl font-black text-white">{coupon.code}</p>
            <p className="mt-1 text-brand">{coupon.discount_type === 'percent' ? `${coupon.value}% OFF` : `${currencyFormatter.format(coupon.value)} OFF`}</p>
          </div>
          <span className={cn('rounded-full px-2 py-1 text-xs font-semibold', status === 'Disponivel' ? 'bg-green-500/15 text-green-400' : status === 'Usado' ? 'bg-zinc-500/15 text-zinc-400' : 'bg-red-500/15 text-red-400')}>{status}</span>
        </div>
        <div className="mt-4 text-sm leading-6 text-zinc-500">
          {coupon.min_order_value ? <p>Pedido minimo: {currencyFormatter.format(coupon.min_order_value)}</p> : null}
          <p>{coupon.expires_at ? `Valido ate ${new Date(coupon.expires_at).toLocaleDateString('pt-BR')}` : 'Sem validade definida'}</p>
        </div>
        <Button className="mt-4" variant="secondary" onClick={() => void copy(coupon.code)}>
          {copied === coupon.code ? 'Copiado' : <><Copy className="mr-2 size-4" /> Copiar codigo</>}
        </Button>
      </article>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Cupons</h2>
        <p className="mt-1 text-sm text-zinc-500">Verifique e copie cupons disponiveis.</p>
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <div className="flex gap-3">
          <input className="input-field flex-1 uppercase" placeholder="Inserir codigo" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} />
          <Button onClick={() => void verify()}>Verificar</Button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </div>
      {coupons.length === 0 ? <EmptyPanel title="Nenhum cupom disponivel no momento" /> : null}
      {available.length > 0 ? (
        <section className="grid gap-3">
          <h3 className="font-semibold text-white">Disponiveis</h3>
          <div className="grid gap-4 md:grid-cols-2">{available.map((coupon) => <CouponCard key={coupon.code} coupon={coupon} />)}</div>
        </section>
      ) : null}
      {old.length > 0 ? (
        <section className="grid gap-3">
          <button type="button" className="text-left font-semibold text-white" onClick={() => setShowOld((value) => !value)}>
            Utilizados/Expirados {showOld ? '−' : '+'}
          </button>
          {showOld ? <div className="grid gap-4 md:grid-cols-2">{old.map((coupon) => <CouponCard key={coupon.code} coupon={coupon} />)}</div> : null}
        </section>
      ) : null}
    </div>
  );
}
