'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Flame, Mail, Lock, Eye, EyeOff } from 'lucide-react';

type LoginFormProps = {
  googleEnabled?: boolean;
};

export function LoginForm({ googleEnabled = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const verified = searchParams.get('verified');
  const reset = searchParams.get('reset');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleCredentialsLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      setError('E-mail ou senha inválidos, ou email ainda não verificado.');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-6 lg:max-w-lg">
      <div className="text-center">
        <Flame className="mx-auto h-10 w-10 text-cafe-orange-500" />
        <h1 className="mt-4 font-display text-3xl font-bold text-text-primary">Bem-vindo de volta ☕</h1>
        <p className="mt-2 text-sm text-text-muted">Acesse sua conta para continuar comprando.</p>
      </div>

      <div className="rounded-card border border-border-subtle bg-background-card p-6">
        <form className="grid gap-4" onSubmit={handleCredentialsLogin}>
          <label className="grid gap-2 text-sm text-text-secondary">
            E-mail
            <span className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                className="input-field w-full pl-10"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="voce@email.com"
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm text-text-secondary">
            Senha
            <span className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                className="input-field w-full pl-10 pr-10"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                minLength={6}
                placeholder="Sua senha"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-text-muted">
              <input type="checkbox" className="rounded border-border-subtle bg-cafe-dark-700 text-cafe-red-500 focus:ring-cafe-red-500/30" />
              Lembrar de mim
            </label>
            <Link href="/forgot-password" className="font-medium text-cafe-orange-500 transition hover:text-cafe-orange-400">
              Esqueci minha senha
            </Link>
          </div>

          {error ? (
            <p className="rounded-lg bg-cafe-red-500/10 px-4 py-2.5 text-sm text-cafe-red-500">{error}</p>
          ) : null}
          {verified === '1' ? (
            <p className="rounded-lg bg-status-success/10 px-4 py-2.5 text-sm text-status-success">E-mail verificado. Você já pode entrar.</p>
          ) : null}
          {verified === 'expired' || verified === 'invalid' ? (
            <p className="rounded-lg bg-cafe-red-500/10 px-4 py-2.5 text-sm text-cafe-red-500">Link de verificação inválido ou expirado.</p>
          ) : null}
          {reset === '1' ? (
            <p className="rounded-lg bg-status-success/10 px-4 py-2.5 text-sm text-status-success">Senha redefinida. Entre com a nova senha.</p>
          ) : null}

          <button type="submit" className="btn-primary mt-2 w-full h-11" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {googleEnabled ? (
          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background-card px-3 text-text-muted">ou continue com</span>
              </div>
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-button border border-border-subtle bg-white px-5 py-3 text-sm font-semibold text-cafe-dark-900 transition hover:bg-gray-50"
              onClick={() => {
                void signIn('google', { callbackUrl });
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Entrar com Google
            </button>
          </div>
        ) : null}

        <p className="mt-6 text-center text-sm text-text-muted">
          Não tem conta?{' '}
          <Link href="/register" className="font-semibold text-cafe-orange-500 transition hover:text-cafe-orange-400">
            Criar agora
          </Link>
        </p>
      </div>
    </div>
  );
}
