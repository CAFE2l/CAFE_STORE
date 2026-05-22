'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Flame, Mail, ArrowLeft } from 'lucide-react';

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
      setError(result.error ?? 'Não foi possível solicitar redefinição.');
      return;
    }

    setMessage(result.message ?? 'Se este email existir, enviaremos um link de redefinição.');
    setDevResetUrl(result.devResetUrl ?? null);
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-6">
      <div className="text-center">
        <Flame className="mx-auto h-10 w-10 text-cafe-orange-500" />
        <h1 className="mt-4 font-display text-3xl font-bold text-text-primary">Recuperar senha</h1>
        <p className="mt-2 text-sm text-text-muted">Informe seu email para receber um link de uso único.</p>
      </div>

      <div className="rounded-card border border-border-subtle bg-background-card p-6">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-text-secondary">
            E-mail
            <span className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input className="input-field w-full pl-10" name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
            </span>
          </label>
          {error ? <p className="rounded-lg bg-cafe-red-500/10 px-4 py-2.5 text-sm text-cafe-red-500">{error}</p> : null}
          {message ? <p className="rounded-lg bg-status-success/10 px-4 py-2.5 text-sm text-status-success">{message}</p> : null}
          {devResetUrl ? (
            <Link href={devResetUrl} className="text-sm font-semibold text-cafe-orange-500 hover:text-cafe-orange-400">
              Abrir link de reset em dev
            </Link>
          ) : null}
          <button type="submit" className="btn-primary mt-2 w-full h-11" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link href="/login" className="inline-flex items-center gap-1 font-medium text-cafe-orange-500 transition hover:text-cafe-orange-400">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
