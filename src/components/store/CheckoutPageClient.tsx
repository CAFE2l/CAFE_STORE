'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { FormEvent, useMemo, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCartStore } from '@/store/cart';
import { fetchAddressByCep } from '@/lib/cep';
import { cn } from '@/lib/utils';
import { PhoneField } from '@/components/ui/PhoneField';
import { useForm } from 'react-hook-form';

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

const STEPS = [
  { label: 'Dados', title: 'Dados pessoais', subtitle: 'Informe seus dados para contato.' },
  { label: 'Endereço', title: 'Endereço', subtitle: 'Preencha o endereço de contato.' },
  { label: 'Pagamento', title: 'Pagamento', subtitle: 'Escolha como prefere pagar.' },
  { label: 'Revisão', title: 'Confirmação', subtitle: 'Revise os dados antes de finalizar.' },
];

function PremiumInput({
  label,
  error,
  required,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; required?: boolean }) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
        {label}{required && <span className="ml-1 text-orange-400">*</span>}
      </label>
      <input
        {...props}
        className={cn(
          'h-11 w-full rounded-xl border bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/25 transition-all duration-200 outline-none',
          'focus:bg-white/[0.06] focus:shadow-[0_0_0_2px_rgba(249,115,22,0.25)]',
          error
            ? 'border-red-500/50 focus:border-red-500/70'
            : 'border-white/[0.08] focus:border-orange-500/50',
        )}
      />
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1 overflow-hidden text-xs text-red-400"
          >
            <AlertCircle className="size-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CheckoutPageClient() {
  const router = useRouter();
  const { clearCart, items, total } = useCartStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const finalTotal = useMemo(() => (items.length > 0 ? total + shipping : 0), [items.length, total]);

  const { control, formState: { errors: phoneErrors }, setValue: setPhoneValue, trigger: triggerPhone } = useForm<{ phone: string }>({
    defaultValues: { phone: '' },
  });

  useEffect(() => setHydrated(true), []);

  // Sync PhoneField value → form.phone for submission
  function handlePhoneChange(value: string) {
    updateForm('phone', value);
    setPhoneValue('phone', value as never);
    if (fieldErrors.phone) setFieldErrors((e) => ({ ...e, phone: undefined }));
  }

  function updateForm<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  const handleCepBlur = useCallback(async () => {
    const cleaned = form.zip.replace(/\D/g, '');
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    const address = await fetchAddressByCep(form.zip);
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

  function validateStep(): boolean {
    const errors: Partial<Record<keyof CheckoutForm, string>> = {};

    if (step === 1) {
      if (!form.name.trim()) errors.name = 'Nome é obrigatório.';
      if (!form.email.trim()) errors.email = 'E-mail é obrigatório.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'E-mail inválido.';
      if (!form.phone || form.phone.replace(/\D/g, '').length < 8) errors.phone = 'Telefone inválido.';
    }

    if (step === 2) {
      if (!form.street.trim()) errors.street = 'Rua é obrigatória.';
      if (!form.number.trim()) errors.number = 'Número é obrigatório.';
      if (!form.neighborhood.trim()) errors.neighborhood = 'Bairro é obrigatório.';
      if (!form.city.trim()) errors.city = 'Cidade é obrigatória.';
      if (!form.state.trim()) errors.state = 'Estado é obrigatório.';
      if (!form.zip.trim()) errors.zip = 'CEP é obrigatório.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function goNext() {
    if (!validateStep()) return;
    setStep((current) => Math.min(4, current + 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
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
      setSubmitError(result.error ?? 'Não foi possível criar o pedido.');
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

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="h-96 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    );
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

  const currentStepData = STEPS[step - 1];

  return (
    <form className="grid gap-8 lg:grid-cols-[1fr_24rem]" onSubmit={handleSubmit}>
      {/* Main card */}
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_4px_32px_rgba(0,0,0,0.4)] backdrop-blur-[12px]">

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => {
            const num = i + 1;
            const isComplete = step > num;
            const isActive = step === num;
            return (
              <div key={s.label} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => isComplete && setStep(num)}
                  className={cn('flex items-center gap-2', isComplete && 'cursor-pointer')}
                >
                  <span className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-all duration-300',
                    isComplete && 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30',
                    isActive && 'bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.25)]',
                    !isComplete && !isActive && 'bg-white/[0.05] text-white/30 ring-1 ring-white/10',
                  )}>
                    {isComplete ? <Check className="size-3.5" /> : num}
                  </span>
                  <span className={cn(
                    'hidden text-xs font-medium sm:inline transition-colors',
                    isActive ? 'text-white' : isComplete ? 'text-green-400/70' : 'text-white/30',
                  )}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    'h-px flex-1 min-w-[20px] transition-colors duration-500',
                    step > num ? 'bg-green-500/40' : 'bg-white/[0.08]',
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step header */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold text-white">{currentStepData.title}</h2>
          <p className="mt-1 text-sm text-white/45">{currentStepData.subtitle}</p>
        </div>

        {/* Step 1 — Personal Data */}
        {step === 1 && (
          <div className="space-y-4">
            <PremiumInput
              label="Nome completo"
              placeholder="Seu nome"
              required
              value={form.name}
              error={fieldErrors.name}
              onChange={(e) => updateForm('name', e.target.value)}
            />
            <PremiumInput
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              required
              value={form.email}
              error={fieldErrors.email}
              onChange={(e) => updateForm('email', e.target.value)}
            />
            <div className="grid gap-1.5">
              <PhoneField
                name="phone"
                label="Telefone / WhatsApp"
                control={control}
                error={phoneErrors.phone ?? (fieldErrors.phone ? { type: 'manual', message: fieldErrors.phone } : undefined)}
                defaultCountry="BR"
                onChange={handlePhoneChange}
              />
            </div>
          </div>
        )}

        {/* Step 2 — Address */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="relative">
              <PremiumInput
                label="CEP"
                placeholder="00000-000"
                maxLength={9}
                required
                value={form.zip}
                error={fieldErrors.zip}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                  const masked = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
                  updateForm('zip', masked);
                }}
                onBlur={handleCepBlur}
              />
              {cepLoading && (
                <span className="absolute right-3 top-8">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <PremiumInput
                label="Rua"
                placeholder="Nome da rua"
                className="sm:col-span-2"
                required
                value={form.street}
                error={fieldErrors.street}
                onChange={(e) => updateForm('street', e.target.value)}
              />
              <PremiumInput
                label="Número"
                placeholder="123"
                required
                value={form.number}
                error={fieldErrors.number}
                onChange={(e) => updateForm('number', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <PremiumInput
                label="Complemento"
                placeholder="Apto, bloco..."
                value={form.complement}
                onChange={(e) => updateForm('complement', e.target.value)}
              />
              <PremiumInput
                label="Bairro"
                placeholder="Bairro"
                required
                value={form.neighborhood}
                error={fieldErrors.neighborhood}
                onChange={(e) => updateForm('neighborhood', e.target.value)}
              />
              <PremiumInput
                label="Cidade"
                placeholder="Cidade"
                required
                value={form.city}
                error={fieldErrors.city}
                onChange={(e) => updateForm('city', e.target.value)}
              />
            </div>
            <PremiumInput
              label="Estado"
              placeholder="UF"
              maxLength={2}
              required
              className="max-w-[100px] uppercase"
              value={form.state}
              error={fieldErrors.state}
              onChange={(e) => updateForm('state', e.target.value.toUpperCase())}
            />
          </div>
        )}

        {/* Step 3 — Payment */}
        {step === 3 && (
          <fieldset className="space-y-3">
            <legend className="mb-4 text-sm font-semibold text-white/70">Método de pagamento</legend>
            {[
              { value: 'pix' as const, label: 'Pix', desc: 'Pagamento instantâneo — aprovação em segundos', icon: '/images/icons/pix.png' },
              { value: 'mercadopago' as const, label: 'Cartão de crédito', desc: 'Até 12x com Mercado Pago', icon: '/images/icons/Mercadopago.png' },
              { value: 'paypal' as const, label: 'PayPal', desc: 'Carteira digital internacional', icon: '/images/icons/PayPal.png' },
            ].map((method) => (
              <label
                key={method.value}
                className={cn(
                  'flex cursor-pointer items-center gap-4 rounded-xl border p-4 text-sm transition-all duration-200',
                  form.paymentMethod === method.value
                    ? 'border-orange-500/40 bg-orange-500/[0.08] shadow-[0_0_16px_rgba(249,115,22,0.08)]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-orange-500/20 hover:bg-white/[0.04]',
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
                {method.icon.startsWith('/') ? (
                  <Image src={method.icon} alt={method.label} width={36} height={36} className="size-9 object-contain" />
                ) : (
                  <span className="text-xl">{method.icon}</span>
                )}
                <span>
                  <span className="block font-medium text-white">{method.label}</span>
                  <span className="text-xs text-white/45">{method.desc}</span>
                </span>
              </label>
            ))
            }
          </fieldset>
        )}

        {/* Step 4 — Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.06] p-4 text-sm leading-6 text-white/60">
              <p className="mb-1 font-semibold text-white">⚡ Apoio simbólico</p>
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
                <div className="flex items-center gap-2">
                  {form.paymentMethod === 'pix' ? (
                    <Image src="/images/icons/pix.png" alt="Pix" width={20} height={20} className="size-5 object-contain" />
                  ) : form.paymentMethod === 'mercadopago' ? (
                    <Image src="/images/icons/Mercadopago.png" alt="Mercado Pago" width={20} height={20} className="size-5 object-contain" />
                  ) : (
                    <Image src="/images/icons/PayPal.png" alt="PayPal" width={20} height={20} className="size-5 object-contain" />
                  )}
                  <span>
                    {form.paymentMethod === 'pix' ? 'Pix' : form.paymentMethod === 'mercadopago' ? 'Cartão de crédito (Mercado Pago)' : 'PayPal'}
                  </span>
                </div>
              </ConfirmationBlock>
            </div>
          </div>
        )}

        {/* Submit error */}
        <AnimatePresence initial={false}>
          {submitError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-5 overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                {submitError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((c) => Math.max(1, c - 1))}
              className="h-11 rounded-xl border border-white/10 px-5 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white"
            >
              ← Voltar
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              className="h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 text-sm font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.35)] transition-all hover:shadow-[0_6px_24px_rgba(249,115,22,0.5)] hover:scale-[1.01]"
            >
              Continuar →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 text-sm font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.35)] transition-all hover:shadow-[0_6px_24px_rgba(249,115,22,0.5)] hover:scale-[1.01] disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Zap className="size-4" />
              )}
              {loading ? 'Processando...' : 'Confirmar apoio'}
            </button>
          )}
        </div>
      </section>

      {/* Sidebar */}
      <aside className="sticky top-28 h-fit rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_4px_32px_rgba(0,0,0,0.4)] backdrop-blur-[12px]">
        <h3 className="font-display text-lg font-semibold text-white">Seu apoio</h3>

        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-white/40">Qtd. {item.quantity}</p>
                <p className="mt-1 text-sm font-semibold text-orange-400">
                  {currencyFormatter.format(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
            Código de desconto
          </label>
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 transition-all outline-none focus:border-orange-500/40 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.15)]"
              placeholder="CÓDIGO"
              value={form.couponCode}
              onChange={(e) => updateForm('couponCode', e.target.value.toUpperCase())}
            />
            <button
              type="button"
              className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 text-xs font-semibold text-orange-400 transition hover:bg-orange-500/20"
            >
              Aplicar
            </button>
          </div>
        </div>

        {/* Totals */}
        <dl className="mt-5 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
          <div className="flex justify-between text-white/50">
            <dt>Subtotal</dt>
            <dd>{currencyFormatter.format(total)}</dd>
          </div>
          <div className="flex justify-between text-white/50">
            <dt>Entrega</dt>
            <dd>Não se aplica</dd>
          </div>
          <div className="flex justify-between border-t border-white/[0.06] pt-3 text-base font-bold text-white">
            <dt>Total</dt>
            <dd className="text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.55)]">
              {currencyFormatter.format(finalTotal)}
            </dd>
          </div>
        </dl>
      </aside>
    </form>
  );
}

function ConfirmationBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-white/60">
      <p className="mb-2 font-semibold text-white">{title}</p>
      {children}
    </div>
  );
}
