'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

type RegisterResponse = {
  success: boolean;
  error?: string;
  data?: {
    devVerificationUrl?: string;
  };
};

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const passwordScore = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const passwordStrength =
    passwordScore <= 1 ? 'fraca' : passwordScore <= 3 ? 'media' : 'forte';

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setDevVerificationUrl(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      cpf: String(formData.get('cpf') ?? ''),
      phone: String(formData.get('phone') ?? ''),
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

    setLoading(false);
    setSuccess('Conta criada. Confirme seu email antes de entrar.');
    setDevVerificationUrl(result.data?.devVerificationUrl ?? null);
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
            Nome completo
            <input
              className="input-field"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Seu nome"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-text-secondary">
              CPF
              <input
                className="input-field"
                name="cpf"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                placeholder="000.000.000-00"
              />
            </label>
            <label className="grid gap-2 text-sm text-text-secondary">
              Telefone
              <input
                className="input-field"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                placeholder="(00) 00000-0000"
              />
            </label>
          </div>
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
              minLength={8}
              placeholder="8+ caracteres, maiuscula, numero e especial"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <span className="grid gap-1 text-xs">
              <span className="h-2 overflow-hidden rounded-full bg-background-surface">
                <span
                  className={
                    passwordStrength === 'forte'
                      ? 'block h-full bg-status-success transition-all'
                      : passwordStrength === 'media'
                        ? 'block h-full bg-accent-glow transition-all'
                        : 'block h-full bg-status-error transition-all'
                  }
                  style={{ width: `${Math.max(12, passwordScore * 25)}%` }}
                />
              </span>
              <span>Forca da senha: {passwordStrength}</span>
            </span>
          </label>
          <label className="grid gap-2 text-sm text-text-secondary">
            Confirmar senha
            <input
              className="input-field"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Repita sua senha"
            />
          </label>
          {error ? <p className="text-sm text-status-error">{error}</p> : null}
          {success ? <p className="text-sm text-status-success">{success}</p> : null}
          {devVerificationUrl ? (
            <Link href={devVerificationUrl} className="text-sm font-semibold text-accent-glow hover:text-accent-primary">
              Abrir link de verificacao em dev
            </Link>
          ) : null}
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
