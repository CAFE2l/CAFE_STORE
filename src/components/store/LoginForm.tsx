'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setError('E-mail ou senha invalidos.');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="glass shadow-warm rounded-2xl p-6">
        <div className="mb-8">
          <p className="badge-amber mb-4">Conta Cafe Store</p>
          <h1 className="font-display text-3xl font-semibold text-text-primary">Entrar</h1>
          <p className="mt-2 text-sm text-text-secondary">Acesse pedidos, perfil e checkout.</p>
        </div>
        <form className="grid gap-4" onSubmit={handleCredentialsLogin}>
          <label className="grid gap-2 text-sm text-text-secondary">
            E-mail
            <input
              className="input-field"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="voce@email.com"
            />
          </label>
          <label className="grid gap-2 text-sm text-text-secondary">
            Senha
            <input
              className="input-field"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              placeholder="Sua senha"
            />
          </label>
          {error ? <p className="text-sm text-status-error">{error}</p> : null}
          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <button
          type="button"
          className="btn-secondary mt-4 w-full"
          onClick={() => {
            void signIn('google', { callbackUrl });
          }}
        >
          Entrar com Google
        </button>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Ainda nao tem conta?{' '}
          <Link href="/register" className="font-semibold text-accent-primary hover:text-accent-glow">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
