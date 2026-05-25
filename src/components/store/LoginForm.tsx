'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Flame, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoginFormProps = {
  googleEnabled?: boolean;
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function LoginForm({ googleEnabled = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') ?? '/';
  const verified = searchParams?.get('verified');
  const reset = searchParams?.get('reset');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [isPhoneMode, setIsPhoneMode] = useState(false);

  function handleLoginInput(value: string) {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 0 && digits.length <= 11 && /^\d+$/.test(digits)) {
      setIsPhoneMode(true);
      setLoginInput(formatPhone(value));
    } else {
      setIsPhoneMode(false);
      setLoginInput(value);
    }
  }

  async function handleCredentialsLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = isPhoneMode ? loginInput.replace(/\D/g, '') : loginInput;

    const result = await signIn('credentials', {
      email,
      password: formData.get('password'),
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      setError('E-mail ou senha incorretos.');
      return;
    }

    router.push(callbackUrl);
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
          <h1 className="text-2xl font-bold text-white font-display">Entrar na sua conta</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Acompanhe seus pedidos, salvos favoritos e finalize compras mais rápido.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-surface-1 p-8 shadow-card">
          <form className="grid gap-5" onSubmit={handleCredentialsLogin} noValidate>
            {/* Email / Telefone */}
            <div className="grid gap-2">
              <label htmlFor="login" className="text-sm font-medium text-zinc-300">
                E-mail ou telefone
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  {isPhoneMode ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </div>
                <input
                  id="login"
                  className="input-base w-full pl-11"
                  type={isPhoneMode ? 'tel' : 'email'}
                  inputMode={isPhoneMode ? 'tel' : 'email'}
                  autoComplete="username"
                  required
                  placeholder="voce@email.com"
                  value={loginInput}
                  onChange={(e) => handleLoginInput(e.target.value)}
                />
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
                  autoComplete="current-password"
                  required
                  minLength={6}
                  placeholder="Sua senha"
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
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-zinc-400 transition-colors hover:text-zinc-300">
                <input
                  type="checkbox"
                  name="remember"
                  defaultChecked
                  className="h-4 w-4 rounded border-zinc-700 bg-surface-2 text-brand focus:ring-brand/30"
                />
                Manter-me conectado
              </label>
              <Link
                href="/forgot-password"
                className="font-medium text-brand transition-colors hover:text-brand-light"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Error messages */}
            {error ? (
              <div className="animate-scaleIn rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : null}
            {verified === '1' ? (
              <div className="animate-scaleIn rounded-xl border border-brand/20 bg-brand/10 px-4 py-3">
                <p className="text-sm text-brand">E-mail verificado. Você já pode entrar.</p>
              </div>
            ) : null}
            {verified === 'expired' || verified === 'invalid' ? (
              <div className="animate-scaleIn rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-400">Link de verificação inválido ou expirado.</p>
              </div>
            ) : null}
            {reset === '1' ? (
              <div className="animate-scaleIn rounded-xl border border-brand/20 bg-brand/10 px-4 py-3">
                <p className="text-sm text-brand">Senha redefinida. Entre com a nova senha.</p>
              </div>
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
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Google */}
          {googleEnabled ? (
            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface-1 px-3 text-zinc-500">ou continue com</span>
                </div>
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-surface-2 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-surface-3 hover:border-zinc-600 active:scale-[0.97]"
                onClick={() => {
                  void signIn('google', { callbackUrl });
                }}
              >
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar com Google
              </button>
            </div>
          ) : null}

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-zinc-500">
            Ainda não tem conta?{' '}
            <Link href="/register" className="font-semibold text-brand transition-colors hover:text-brand-light">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
