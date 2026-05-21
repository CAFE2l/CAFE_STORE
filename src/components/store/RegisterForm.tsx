'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

type RegisterResponse = {
  success: boolean;
  error?: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      confirmPassword: String(formData.get('confirmPassword') ?? ''),
    };

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as RegisterResponse;

    if (!result.success) {
      setLoading(false);
      setError(result.error ?? 'Nao foi possivel criar sua conta.');
      return;
    }

    const signInResult = await signIn('credentials', {
      email: payload.email,
      password: payload.password,
      redirect: false,
      callbackUrl: '/',
    });

    setLoading(false);

    if (signInResult?.error) {
      router.push('/login');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="glass shadow-warm rounded-2xl p-6">
        <div className="mb-8">
          <p className="badge-amber mb-4">Nova conta</p>
          <h1 className="font-display text-3xl font-semibold text-text-primary">Criar conta</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Cadastre-se para comprar, favoritar produtos e acompanhar pedidos.
          </p>
        </div>
        <form className="grid gap-4" onSubmit={handleRegister}>
          <label className="grid gap-2 text-sm text-text-secondary">
            Nome
            <input
              className="input-field"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Seu nome"
            />
          </label>
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
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="Minimo de 6 caracteres"
            />
          </label>
          <label className="grid gap-2 text-sm text-text-secondary">
            Confirmar senha
            <input
              className="input-field"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="Repita sua senha"
            />
          </label>
          {error ? <p className="text-sm text-status-error">{error}</p> : null}
          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Ja tem conta?{' '}
          <Link href="/login" className="font-semibold text-accent-primary hover:text-accent-glow">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
