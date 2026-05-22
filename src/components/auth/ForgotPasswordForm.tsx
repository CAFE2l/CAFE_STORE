'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type ForgotPasswordResponse = {
  success: boolean;
  message?: string;
  error?: string;
  devResetUrl?: string;
};

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setDevResetUrl(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: String(formData.get('email') ?? '') }),
    });
    const result = (await response.json()) as ForgotPasswordResponse;
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Nao foi possivel solicitar redefinicao.');
      return;
    }

    setMessage(result.message ?? 'Se este email existir, enviaremos um link de redefinicao.');
    setDevResetUrl(result.devResetUrl ?? null);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="glass rounded-2xl p-6 shadow-warm">
        <div className="mb-8">
          <p className="badge-amber mb-4">Seguranca</p>
          <h1 className="font-display text-3xl font-semibold text-text-primary">Esqueci minha senha</h1>
          <p className="mt-2 text-sm text-text-secondary">Informe seu email para receber um link de uso unico.</p>
        </div>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-text-secondary">
            E-mail
            <input className="input-field" name="email" type="email" autoComplete="email" required />
          </label>
          {error ? <p className="text-sm text-status-error">{error}</p> : null}
          {message ? <p className="text-sm text-status-success">{message}</p> : null}
          {devResetUrl ? (
            <Link href={devResetUrl} className="text-sm font-semibold text-accent-glow hover:text-accent-primary">
              Abrir link de reset em dev
            </Link>
          ) : null}
          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>
      </div>
    </div>
  );
}
