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
    };
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
    const params = new URLSearchParams({
      orderId: result.data.orderId,
      method: result.data.paymentMethod,
    });

    if (result.data.pix?.payload) {
      params.set('pix', result.data.pix.payload);
      params.set('qr', result.data.pix.qrCodeUrl);
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
      <section className="glass rounded-2xl p-5 shadow-warm">
        <div className="mb-6 flex flex-wrap gap-2">
          {['Dados', 'Endereco', 'Pagamento', 'Confirmacao'].map((label, index) => (
            <button
              key={label}
              type="button"
              className={
                step === index + 1
                  ? 'rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-background-base'
                  : 'rounded-full border border-white/10 px-4 py-2 text-sm text-text-secondary'
              }
              onClick={() => setStep(index + 1)}
            >
              {label}
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
            <legend className="mb-2 text-sm font-semibold text-text-primary">Metodo de pagamento</legend>
            {[
              { value: 'pix', label: 'Pix manual' },
              { value: 'mercadopago', label: 'Mercado Pago' },
              { value: 'paypal', label: 'PayPal' },
            ].map((method) => (
              <label key={method.value} className="card flex cursor-pointer items-center gap-3 p-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={form.paymentMethod === method.value}
                  onChange={() => updateForm('paymentMethod', method.value as CheckoutForm['paymentMethod'])}
                />
                <span className="font-medium text-text-primary">{method.label}</span>
              </label>
            ))}
          </fieldset>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-4 text-sm text-text-secondary">
            <p className="text-text-primary">Revise os dados e confirme o pedido.</p>
            <p>{form.name} - {form.email} - {form.phone}</p>
            <p>
              {form.street}, {form.number} - {form.neighborhood}, {form.city}/{form.state.toUpperCase()}
            </p>
            <p>Pagamento: {form.paymentMethod}</p>
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

      <aside className="glass sticky top-28 h-fit rounded-2xl p-5 shadow-warm">
        <h2 className="font-display text-2xl font-semibold text-text-primary">Pedido</h2>
        <div className="mt-5 grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[3.5rem_1fr_auto] gap-3">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-background-surface">
                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{item.name}</p>
                <p className="text-xs text-text-muted">Qtd. {item.quantity}</p>
              </div>
              <p className="text-sm text-text-secondary">{currencyFormatter.format(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <dl className="mt-5 grid gap-3 border-t border-border-subtle pt-4 text-sm">
          <div className="flex justify-between text-text-secondary">
            <dt>Subtotal</dt>
            <dd>{currencyFormatter.format(total)}</dd>
          </div>
          <div className="flex justify-between text-text-secondary">
            <dt>Frete</dt>
            <dd>{currencyFormatter.format(shipping)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold text-text-primary">
            <dt>Total</dt>
            <dd>{currencyFormatter.format(finalTotal)}</dd>
          </div>
        </dl>
      </aside>
    </form>
  );
}
