'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

type ResetPasswordResponse = {
  success: boolean;
  error?: string;
};

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        token,
        password: String(formData.get('password') ?? ''),
        confirmPassword: String(formData.get('confirmPassword') ?? ''),
      }),
    });
    const result = (await response.json()) as ResetPasswordResponse;
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Nao foi possivel redefinir sua senha.');
      return;
    }

    setDone(true);
    router.refresh();
  }

  if (!email || !token) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="glass rounded-2xl p-6 text-sm text-text-secondary shadow-warm">
          Link de redefinicao invalido. Solicite um novo link em{' '}
          <Link href="/forgot-password" className="font-semibold text-accent-glow hover:text-accent-primary">
            esqueci minha senha
          </Link>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="glass rounded-2xl p-6 shadow-warm">
        <div className="mb-8">
          <p className="badge-amber mb-4">Nova senha</p>
          <h1 className="font-display text-3xl font-semibold text-text-primary">Redefinir senha</h1>
          <p className="mt-2 text-sm text-text-secondary">Use uma senha forte para proteger sua conta.</p>
        </div>
        {done ? (
          <div className="grid gap-4">
            <p className="text-sm text-status-success">Senha alterada com sucesso.</p>
            <Link href="/login?reset=1" className="btn-primary text-center">
              Entrar
            </Link>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm text-text-secondary">
              Nova senha
              <input
                className="input-field"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="8+ caracteres, maiuscula, numero e especial"
              />
            </label>
            <label className="grid gap-2 text-sm text-text-secondary">
              Confirmar nova senha
              <input className="input-field" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
            </label>
            {error ? <p className="text-sm text-status-error">{error}</p> : null}
            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
