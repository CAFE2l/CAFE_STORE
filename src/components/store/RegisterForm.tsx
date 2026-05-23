'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Flame, User, Mail, Lock, Phone, FileText, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type RegisterResponse = {
  success: boolean;
  error?: string;
  data?: {
    devVerificationUrl?: string;
  };
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptPromotions, setAcceptPromotions] = useState(false);
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');

  const passwordScore = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const passwordStrength =
    passwordScore <= 1 ? 'fraca' : passwordScore <= 3 ? 'média' : 'forte';
  const strengthColor =
    passwordStrength === 'forte'
      ? 'bg-status-success'
      : passwordStrength === 'média'
        ? 'bg-brand'
        : 'bg-red-500';
  const strengthWidth = `${Math.max(8, passwordScore * 25)}%`;

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setDevVerificationUrl(null);

    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }

    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      cpf: cpf.replace(/\D/g, ''),
      phone: phone.replace(/\D/g, ''),
      password: String(formData.get('password') ?? ''),
      confirmPassword: String(formData.get('confirmPassword') ?? ''),
      acceptPromotions,
    };

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as RegisterResponse;

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Não foi possível criar sua conta.');
      return;
    }

    setSuccess('Conta criada! Confirme seu e-mail antes de entrar.');
    setDevVerificationUrl(result.data?.devVerificationUrl ?? null);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center justify-center px-4 py-12">
      <div className="w-full animate-fade-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 shadow-glow-sm">
            <Flame className="h-7 w-7 text-brand" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Criar sua conta</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Crie sua conta e tenha uma experiência de compra mais rápida, segura e personalizada.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-surface-1 p-8 shadow-card">
          <form className="grid gap-5" onSubmit={handleRegister} noValidate>
            {/* Nome completo */}
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                Nome completo
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="name"
                  className="input-base w-full pl-11"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            {/* E-mail */}
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="email"
                  className="input-base w-full pl-11"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="voce@email.com"
                />
              </div>
            </div>

            {/* Telefone + CPF */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="phone" className="text-sm font-medium text-zinc-300">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="phone"
                    className="input-base w-full pl-11"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="cpf" className="text-sm font-medium text-zinc-300">
                  CPF
                </label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="cpf"
                    className="input-base w-full pl-11"
                    name="cpf"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="password"
                  className="input-base w-full pl-11 pr-11"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="8+ caracteres, maiúscula, número e especial"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength meter */}
              {password.length > 0 ? (
                <div className="mt-1 animate-fadeIn">
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <span
                      className={cn('block h-full rounded-full transition-all duration-300', strengthColor)}
                      style={{ width: strengthWidth }}
                    />
                  </div>
                  <p
                    className={cn(
                      'mt-1 text-xs',
                      passwordStrength === 'fraca'
                        ? 'text-red-400'
                        : passwordStrength === 'média'
                          ? 'text-brand'
                          : 'text-status-success',
                    )}
                  >
                    {passwordStrength === 'fraca' && 'Senha fraca — adicione maiúscula, número e caractere especial'}
                    {passwordStrength === 'média' && 'Senha média — está no caminho certo'}
                    {passwordStrength === 'forte' && 'Senha forte'}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Confirmar senha */}
            <div className="grid gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="confirmPassword"
                  className="input-base w-full pl-11 pr-11"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Repita sua senha"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid gap-3 pt-1">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-400 transition-colors hover:text-zinc-300">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-surface-2 text-brand focus:ring-brand/30"
                />
                <span>
                  Aceito os{' '}
                  <Link href="/termos" className="font-medium text-brand hover:text-brand-light">
                    Termos de Uso
                  </Link>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-400 transition-colors hover:text-zinc-300">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-surface-2 text-brand focus:ring-brand/30"
                />
                <span>
                  Aceito a{' '}
                  <Link href="/privacidade" className="font-medium text-brand hover:text-brand-light">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-500 transition-colors hover:text-zinc-400">
                <input
                  type="checkbox"
                  checked={acceptPromotions}
                  onChange={(e) => setAcceptPromotions(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-surface-2 text-brand focus:ring-brand/30"
                />
                <span>Quero receber ofertas e novidades por e-mail (opcional)</span>
              </label>
            </div>

            {/* Messages */}
            {error ? (
              <div className="animate-scaleIn rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : null}
            {success ? (
              <div className="animate-scaleIn rounded-xl border border-brand/20 bg-brand/10 px-4 py-3">
                <p className="text-sm text-brand">{success}</p>
              </div>
            ) : null}
            {devVerificationUrl ? (
              <Link
                href={devVerificationUrl}
                className="text-center text-sm font-medium text-brand transition-colors hover:text-brand-light"
              >
                Abrir link de verificação (dev)
              </Link>
            ) : null}

            {/* Submit */}
            <button
              type="submit"
              className={cn(
                'btn-primary mt-1 w-full h-12 text-base',
                loading && 'pointer-events-none opacity-80',
              )}
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando conta...
                </span>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-8 text-center text-sm text-zinc-500">
            Já tem conta?{' '}
            <Link href="/login" className="font-semibold text-brand transition-colors hover:text-brand-light">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
