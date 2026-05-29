'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cart';
import { fetchAddressByCep } from '@/lib/cep';
import { cn } from '@/lib/utils';

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

const shipping = 0;

const STEP_ICONS = ['1', '2', '3', '✓'];

function StepIndicator({ step, current }: { step: number; current: number }) {
  const isComplete = current > step;
  const isActive = current === step;
  return (
    <span
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-all',
        isComplete && 'bg-emerald-500/20 text-emerald-400',
        isActive && 'bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/30',
        !isComplete && !isActive && 'bg-zinc-800 text-zinc-600',
      )}
    >
      {isComplete ? '✓' : step}
    </span>
  );
}

function StepConnector({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        'h-px flex-1 transition-colors',
        active ? 'bg-emerald-500/40' : 'bg-zinc-800',
      )}
    />
  );
}

export function CheckoutPageClient() {
  const router = useRouter();
  const { clearCart, items, total } = useCartStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const finalTotal = useMemo(() => (items.length > 0 ? total + shipping : 0), [items.length, total]);

  function updateForm<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  const handleCepBlur = useCallback(async () => {
    const raw = form.zip;
    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    const address = await fetchAddressByCep(raw);
    if (address) {
      setForm((prev) => ({
        ...prev,
        street: prev.street || address.street,
        neighborhood: prev.neighborhood || address.neighborhood,
        city: prev.city || address.city,
        state: prev.state || address.state,
      }));
    }
    setCepLoading(false);
  }, [form.zip]);

  function validateCurrentStep() {
    if (step === 1 && (!form.name || !form.email || !form.phone)) {
      return 'Preencha nome, e-mail e telefone.';
    }

    if (
      step === 2 &&
      (!form.street || !form.number || !form.neighborhood || !form.city || !form.state || !form.zip)
    ) {
      return 'Preencha todos os dados de endereço.';
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name: form.name, email: form.email, phone: form.phone },
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
      setError(result.error ?? 'Não foi possível criar o pedido.');
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
        subtitle="Adicione um apoio simbólico ao carrinho antes de continuar."
        action={{ href: '/products', label: 'Ver apoios' }}
      />
    );
  }

  return (
    <form className="grid gap-8 lg:grid-cols-[1fr_24rem]" onSubmit={handleSubmit}>
      {/* Main content */}
      <section className="rounded-card border border-border-subtle bg-background-card p-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            {step === 1 && 'Dados pessoais'}
            {step === 2 && 'Endereço'}
            {step === 3 && 'Pagamento'}
            {step === 4 && 'Confirmação'}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {step === 1 && 'Informe seus dados para contato.'}
            {step === 2 && 'Preencha o endereço de contato.'}
            {step === 3 && 'Escolha como prefere pagar.'}
            {step === 4 && 'Revise os dados antes de finalizar.'}
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {[1, 2, 3, 4].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(s)}
                className="flex items-center gap-2"
              >
                <StepIndicator step={s} current={step} />
                <span
                  className={cn(
                    'hidden text-xs font-medium sm:inline',
                    step === s ? 'text-text-primary' : 'text-text-muted',
                  )}
                >
                  {['Dados', 'Endereço', 'Pagamento', 'Revisão'][i]}
                </span>
              </button>
              {i < 3 ? <StepConnector active={step > s} /> : null}
            </div>
          ))}
        </div>

        {/* Step 1 — Personal Data */}
        {step === 1 && (
          <div className="space-y-5">
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(event) => updateForm('email', event.target.value)}
            />
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={(event) => updateForm('phone', event.target.value)}
            />
          </div>
        )}

        {/* Step 2 — Address with CEP Autocomplete */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="relative">
              <Input
                label="CEP"
                placeholder="00000-000"
                maxLength={9}
                value={form.zip}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                  const masked = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
                  updateForm('zip', masked);
                }}
                onBlur={handleCepBlur}
              />
              {cepLoading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Input
                label="Rua"
                placeholder="Nome da rua"
                className="sm:col-span-2"
                value={form.street}
                onChange={(event) => updateForm('street', event.target.value)}
              />
              <Input
                label="Número"
                placeholder="123"
                value={form.number}
                onChange={(event) => updateForm('number', event.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Input
                label="Complemento"
                placeholder="Apto, bloco..."
                value={form.complement}
                onChange={(event) => updateForm('complement', event.target.value)}
              />
              <Input
                label="Bairro"
                placeholder="Bairro"
                value={form.neighborhood}
                onChange={(event) => updateForm('neighborhood', event.target.value)}
              />
              <Input
                label="Cidade"
                placeholder="Cidade"
                value={form.city}
                onChange={(event) => updateForm('city', event.target.value)}
              />
            </div>
            <Input
              label="Estado"
              placeholder="UF"
              maxLength={2}
              className="max-w-[100px] uppercase"
              value={form.state}
              onChange={(event) => updateForm('state', event.target.value.toUpperCase())}
            />
          </div>
        )}

        {/* Step 3 — Payment */}
        {step === 3 && (
          <fieldset className="space-y-3">
            <legend className="mb-4 text-sm font-semibold text-text-primary">Método de pagamento</legend>
            {[
              { value: 'pix' as const, label: 'Pix', desc: 'Pagamento instantâneo — aprovação em segundos' },
              { value: 'mercadopago' as const, label: 'Cartão de crédito', desc: 'Até 12x com Mercado Pago' },
              { value: 'paypal' as const, label: 'PayPal', desc: 'Carteira digital internacional' },
            ].map((method) => (
              <label
                key={method.value}
                className={cn(
                  'flex cursor-pointer items-center gap-4 rounded-xl border p-4 text-sm transition-all duration-200',
                  form.paymentMethod === method.value
                    ? 'border-orange-500/30 bg-orange-500/[0.06]'
                    : 'border-border-subtle hover:border-orange-500/20 hover:bg-white/[0.02]',
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={form.paymentMethod === method.value}
                  onChange={() => updateForm('paymentMethod', method.value)}
                  className="size-4 accent-orange-500"
                />
                <span>
                  <span className="block font-medium text-text-primary">{method.label}</span>
                  <span className="text-xs text-text-muted">{method.desc}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}

        {/* Step 4 — Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.06] p-4 text-sm leading-6 text-text-secondary">
              <p className="mb-1 font-semibold text-text-primary">Aviso sobre o apoio</p>
              <p>
                As imagens dos itens são ilustrativas. Este pedido representa uma doação simbólica
                para apoiar o projeto CAFÉ STORE e não gera envio de produto físico.
              </p>
            </div>
            <div className="space-y-3">
              <ConfirmationBlock title="Dados pessoais">
                <p>{form.name}</p>
                <p>{form.email}</p>
                <p>{form.phone}</p>
              </ConfirmationBlock>
              <ConfirmationBlock title="Endereço">
                <p>{form.street}, {form.number}{form.complement ? ` - ${form.complement}` : ''}</p>
                <p>{form.neighborhood} — {form.city}/{form.state.toUpperCase()}</p>
                <p>CEP: {form.zip}</p>
              </ConfirmationBlock>
              <ConfirmationBlock title="Pagamento">
                <p className="capitalize">
                  {form.paymentMethod === 'pix' ? 'Pix' : form.paymentMethod === 'mercadopago' ? 'Cartão de crédito (Mercado Pago)' : 'PayPal'}
                </p>
              </ConfirmationBlock>
            </div>
          </div>
        )}

        {error ? (
          <p className="mt-6 rounded-lg bg-status-error/10 px-4 py-3 text-sm text-status-error">{error}</p>
        ) : null}

        {/* Navigation buttons */}
        <div className="mt-8 flex flex-wrap gap-3">
          {step > 1 && (
            <Button type="button" variant="ghost" onClick={() => setStep((c) => Math.max(1, c - 1))}>
              Voltar
            </Button>
          )}
          {step < 4 ? (
            <Button type="button" onClick={goNext}>
              Continuar
            </Button>
          ) : (
            <Button type="submit" loading={loading}>
              Confirmar apoio
            </Button>
          )}
        </div>
      </section>

      {/* Order Summary Sidebar */}
      <aside className="sticky top-28 h-fit space-y-5">
        <div className="rounded-card border border-border-subtle bg-background-card p-5">
          <h3 className="font-display text-lg font-semibold text-text-primary">Seu apoio</h3>
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-cafe-dark-700">
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{item.name}</p>
                  <p className="text-xs text-text-muted">Qtd. {item.quantity}</p>
                  <p className="mt-1 text-sm font-medium text-text-secondary">
                    {currencyFormatter.format(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Cupom de desconto</label>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-orange-500/50 focus:outline-none"
                placeholder="Código"
                value={form.couponCode}
                onChange={(e) => updateForm('couponCode', e.target.value.toUpperCase())}
              />
            </div>
          </div>

          {/* Totals */}
          <dl className="mt-5 space-y-2 border-t border-border-subtle pt-4 text-sm">
            <div className="flex justify-between text-text-secondary">
              <dt>Subtotal</dt>
              <dd>{currencyFormatter.format(total)}</dd>
            </div>
            <div className="flex justify-between text-text-secondary">
              <dt>Entrega</dt>
              <dd>Não se aplica</dd>
            </div>
            <div className="flex justify-between border-t border-border-subtle pt-3 text-base font-bold text-text-primary">
              <dt>Total</dt>
              <dd>{currencyFormatter.format(finalTotal)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </form>
  );
}

function ConfirmationBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-cafe-dark-700 p-4 text-sm text-text-secondary">
      <p className="mb-2 font-semibold text-text-primary">{title}</p>
      {children}
    </div>
  );
}
