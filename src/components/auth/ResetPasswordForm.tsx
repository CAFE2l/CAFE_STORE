'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Flame, Lock } from 'lucide-react';

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
  const [password, setPassword] = useState('');

  const passwordScore = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const passwordStrength = passwordScore <= 1 ? 'fraca' : passwordScore <= 3 ? 'média' : 'forte';
  const strengthColor = passwordStrength === 'forte' ? 'bg-status-success' : passwordStrength === 'média' ? 'bg-cafe-yellow-500' : 'bg-cafe-red-500';

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
      setError(result.error ?? 'Não foi possível redefinir sua senha.');
      return;
    }

    setDone(true);
    router.refresh();
  }

  if (!email || !token) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-card border border-border-subtle bg-background-card p-6 text-center text-sm text-text-muted">
          Link de redefinição inválido. Solicite um novo link em{' '}
          <Link href="/forgot-password" className="font-semibold text-cafe-orange-500 hover:text-cafe-orange-400">
            esqueci minha senha
          </Link>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-6">
      <div className="text-center">
        <Flame className="mx-auto h-10 w-10 text-cafe-orange-500" />
        <h1 className="mt-4 font-display text-3xl font-bold text-text-primary">Nova senha</h1>
        <p className="mt-2 text-sm text-text-muted">Escolha uma senha forte para proteger sua conta.</p>
      </div>

      <div className="rounded-card border border-border-subtle bg-background-card p-6">
        {done ? (
          <div className="grid gap-4 text-center">
            <p className="text-status-success">Senha alterada com sucesso!</p>
            <Link href="/login?reset=1" className="btn-primary mx-auto">
              Fazer login
            </Link>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm text-text-secondary">
              Nova senha
              <span className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  className="input-field w-full pl-10"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="8+ caracteres, maiúscula, número e especial"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </span>
              <span className="grid gap-1 text-xs">
                <span className="h-1.5 overflow-hidden rounded-full bg-cafe-dark-700">
                  <span className={strengthColor + ' block h-full transition-all duration-300'} style={{ width: `${Math.max(8, passwordScore * 25)}%` }} />
                </span>
                <span className="text-text-muted">Força: {passwordStrength}</span>
              </span>
            </label>
            <label className="grid gap-2 text-sm text-text-secondary">
              Confirmar nova senha
              <span className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input className="input-field w-full pl-10" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} placeholder="Repita a senha" />
              </span>
            </label>
            {error ? <p className="rounded-lg bg-cafe-red-500/10 px-4 py-2.5 text-sm text-cafe-red-500">{error}</p> : null}
            <button type="submit" className="btn-primary mt-2 w-full h-11" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
