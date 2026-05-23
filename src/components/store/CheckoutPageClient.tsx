'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cart';

type CheckoutResponse = {
  success: boolean;
  data?: {
    orderId: string;
    paymentMethod: string;
    pix?: {
      payload: string;
      qrCodeUrl: string;
      key?: string;
      keyQrCodeUrl?: string;
    };
    mpInitPoint?: string;
    paypalApprovalUrl?: string;
  };
  error?: string;
};

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  paymentMethod: 'pix' | 'mercadopago' | 'paypal';
  couponCode: string;
};

const initialForm: CheckoutForm = {
  name: '',
  email: '',
  phone: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zip: '',
  paymentMethod: 'pix',
  couponCode: '',
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const shipping = 18.9;

export function CheckoutPageClient() {
  const router = useRouter();
  const { clearCart, items, total } = useCartStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const finalTotal = useMemo(() => (items.length > 0 ? total + shipping : 0), [items.length, total]);

  function updateForm<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validateCurrentStep() {
    if (step === 1 && (!form.name || !form.email || !form.phone)) {
      return 'Preencha nome, e-mail e telefone.';
    }

    if (
      step === 2 &&
      (!form.street || !form.number || !form.neighborhood || !form.city || !form.state || !form.zip)
    ) {
      return 'Preencha os dados obrigatorios do endereco.';
    }

    return null;
  }

  function goNext() {
    const validationError = validateCurrentStep();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setStep((current) => Math.min(4, current + 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
        },
        address: {
          street: form.street,
          number: form.number,
          complement: form.complement,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state.toUpperCase(),
          zip: form.zip,
        },
        paymentMethod: form.paymentMethod,
        couponCode: form.couponCode || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variants: item.variants,
        })),
      }),
    });
    const result = (await response.json()) as CheckoutResponse;
    setLoading(false);

    if (!result.success || !result.data) {
      setError(result.error ?? 'Nao foi possivel criar o pedido.');
      return;
    }

    clearCart();

    if (result.data.paymentMethod === 'mercadopago' && result.data.mpInitPoint) {
      window.location.href = result.data.mpInitPoint;
      return;
    }

    if (result.data.paymentMethod === 'paypal' && result.data.paypalApprovalUrl) {
      window.location.href = result.data.paypalApprovalUrl;
      return;
    }

    const params = new URLSearchParams({
      orderId: result.data.orderId,
      method: result.data.paymentMethod,
    });

    if (result.data.pix?.payload) {
      params.set('pix', result.data.pix.payload);
      params.set('qr', result.data.pix.qrCodeUrl);
      if (result.data.pix.key) params.set('pixKey', result.data.pix.key);
      if (result.data.pix.keyQrCodeUrl) params.set('pixKeyQr', result.data.pix.keyQrCodeUrl);
    }

    router.push(`/checkout/confirmation?${params.toString()}`);
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nada para finalizar"
        subtitle="Adicione produtos ao carrinho antes de abrir o checkout."
        action={{ href: '/products', label: 'Ver produtos' }}
      />
    );
  }

  return (
    <form className="grid gap-8 lg:grid-cols-[1fr_24rem]" onSubmit={handleSubmit}>
      <section className="rounded-card border border-border-subtle bg-background-card p-5">
        <div className="mb-6 flex items-center gap-2">
          {[
            { label: 'Dados', step: 1 },
            { label: 'Endereço', step: 2 },
            { label: 'Pagamento', step: 3 },
            { label: 'Confirmação', step: 4 },
          ].map((item, index) => (
            <button
              key={item.label}
              type="button"
              className={`flex items-center gap-2 text-sm font-medium transition-all ${
                step > item.step
                  ? 'text-status-success'
                  : step === item.step
                    ? 'text-cafe-orange-500'
                    : 'text-text-muted'
              }`}
              onClick={() => setStep(item.step)}
            >
              <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${
                step > item.step
                  ? 'bg-status-success/15 text-status-success'
                  : step === item.step
                    ? 'bg-cafe-orange-500/15 text-cafe-orange-500'
                    : 'bg-cafe-dark-700 text-text-muted'
              }`}>
                {step > item.step ? '✓' : item.step}
              </span>
              <span className={`hidden sm:inline ${step === item.step ? 'text-text-primary' : ''}`}>{item.label}</span>
              {index < 3 ? <span className="hidden h-px w-6 bg-border-subtle sm:block" /> : null}
            </button>
          ))}
        </div>

        {step === 1 ? (
          <div className="grid gap-4">
            <Input label="Nome" value={form.name} onChange={(event) => updateForm('name', event.target.value)} />
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(event) => updateForm('email', event.target.value)}
            />
            <Input label="Telefone" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Rua"
              className="sm:col-span-2"
              value={form.street}
              onChange={(event) => updateForm('street', event.target.value)}
            />
            <Input label="Numero" value={form.number} onChange={(event) => updateForm('number', event.target.value)} />
            <Input
              label="Complemento"
              value={form.complement}
              onChange={(event) => updateForm('complement', event.target.value)}
            />
            <Input
              label="Bairro"
              value={form.neighborhood}
              onChange={(event) => updateForm('neighborhood', event.target.value)}
            />
            <Input label="Cidade" value={form.city} onChange={(event) => updateForm('city', event.target.value)} />
            <Input
              label="Estado"
              maxLength={2}
              value={form.state}
              onChange={(event) => updateForm('state', event.target.value)}
            />
            <Input label="CEP" value={form.zip} onChange={(event) => updateForm('zip', event.target.value)} />
          </div>
        ) : null}

        {step === 3 ? (
          <fieldset className="grid gap-3">
            <legend className="mb-2 text-sm font-semibold text-text-primary">Método de pagamento</legend>
            {[
              { value: 'pix', label: 'Pix', desc: 'Pagamento instantâneo' },
              { value: 'mercadopago', label: 'Cartão de crédito', desc: 'Até 12x com Mercado Pago' },
              { value: 'paypal', label: 'PayPal', desc: 'Internacional' },
            ].map((method) => (
              <label key={method.value} className={`flex cursor-pointer items-center gap-4 rounded-button border p-4 text-sm transition ${
                form.paymentMethod === method.value
                  ? 'border-cafe-orange-500 bg-cafe-orange-500/5'
                  : 'border-border-subtle hover:border-cafe-orange-500/40'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={form.paymentMethod === method.value}
                  onChange={() => updateForm('paymentMethod', method.value as CheckoutForm['paymentMethod'])}
                  className="text-cafe-orange-500 focus:ring-cafe-orange-500/30"
                />
                <span>
                  <span className="block font-medium text-text-primary">{method.label}</span>
                  <span className="text-xs text-text-muted">{method.desc}</span>
                </span>
              </label>
            ))}
          </fieldset>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-4">
            <div className="rounded-lg bg-cafe-dark-700 p-4 text-sm text-text-secondary">
              <p className="mb-2 font-semibold text-text-primary">Dados pessoais</p>
              <p>{form.name}</p>
              <p>{form.email}</p>
              <p>{form.phone}</p>
            </div>
            <div className="rounded-lg bg-cafe-dark-700 p-4 text-sm text-text-secondary">
              <p className="mb-2 font-semibold text-text-primary">Endereço de entrega</p>
              <p>{form.street}, {form.number} {form.complement ? `- ${form.complement}` : ''}</p>
              <p>{form.neighborhood} - {form.city}/{form.state.toUpperCase()}</p>
              <p>CEP: {form.zip}</p>
            </div>
            <div className="rounded-lg bg-cafe-dark-700 p-4 text-sm text-text-secondary">
              <p className="mb-2 font-semibold text-text-primary">Pagamento</p>
              <p className="capitalize">{form.paymentMethod === 'pix' ? 'Pix' : form.paymentMethod === 'mercadopago' ? 'Cartão de crédito (Mercado Pago)' : 'PayPal'}</p>
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-5 text-sm text-status-error">{error}</p> : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {step > 1 ? (
            <Button type="button" variant="ghost" onClick={() => setStep((current) => Math.max(1, current - 1))}>
              Voltar
            </Button>
          ) : null}
          {step < 4 ? (
            <Button type="button" onClick={goNext}>
              Continuar
            </Button>
          ) : (
            <Button type="submit" loading={loading}>
              Confirmar pedido
            </Button>
          )}
        </div>
      </section>

      <aside className="sticky top-28 h-fit rounded-card border border-border-subtle bg-background-card p-5">
        <h2 className="font-display text-xl font-semibold text-text-primary">Seu pedido</h2>
        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[3rem_1fr_auto] gap-3">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-cafe-dark-700">
                <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{item.name}</p>
                <p className="text-xs text-text-muted">Qtd. {item.quantity}</p>
              </div>
              <p className="text-sm text-text-secondary">{currencyFormatter.format(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-brand/60 focus:outline-none"
            placeholder="Cupom de desconto"
            value={form.couponCode}
            onChange={(e) => updateForm('couponCode', e.target.value.toUpperCase())}
          />
        </div>
        <dl className="mt-4 grid gap-2 border-t border-border-subtle pt-4 text-sm">
          <div className="flex justify-between text-text-secondary">
            <dt>Subtotal</dt>
            <dd>{currencyFormatter.format(total)}</dd>
          </div>
          <div className="flex justify-between text-text-secondary">
            <dt>Frete</dt>
            <dd>{currencyFormatter.format(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-border-subtle pt-2 text-base font-bold text-text-primary">
            <dt>Total</dt>
            <dd>{currencyFormatter.format(finalTotal)}</dd>
          </div>
        </dl>
      </aside>
    </form>
  );
}
