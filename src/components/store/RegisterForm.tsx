'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Flame, User, Mail, Lock, Phone, FileText } from 'lucide-react';

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
  const passwordStrength = passwordScore <= 1 ? 'fraca' : passwordScore <= 3 ? 'média' : 'forte';
  const strengthColor = passwordStrength === 'forte' ? 'bg-status-success' : passwordStrength === 'média' ? 'bg-cafe-yellow-500' : 'bg-cafe-red-500';

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as RegisterResponse;

    if (!result.success) {
      setLoading(false);
      setError(result.error ?? 'Não foi possível criar sua conta.');
      return;
    }

    setLoading(false);
    setSuccess('Conta criada. Confirme seu email antes de entrar.');
    setDevVerificationUrl(result.data?.devVerificationUrl ?? null);
    router.refresh();
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-6 lg:max-w-lg">
      <div className="text-center">
        <Flame className="mx-auto h-10 w-10 text-cafe-orange-500" />
        <h1 className="mt-4 font-display text-3xl font-bold text-text-primary">Criar conta 🔥</h1>
        <p className="mt-2 text-sm text-text-muted">Cadastre-se para comprar e acompanhar seus pedidos.</p>
      </div>

      <div className="rounded-card border border-border-subtle bg-background-card p-6">
        <form className="grid gap-4" onSubmit={handleRegister}>
          <label className="grid gap-2 text-sm text-text-secondary">
            Nome completo
            <span className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input className="input-field w-full pl-10" name="name" type="text" autoComplete="name" required placeholder="Seu nome" />
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-text-secondary">
              CPF
              <span className="relative">
                <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input className="input-field w-full pl-10" name="cpf" type="text" inputMode="numeric" autoComplete="off" required placeholder="000.000.000-00" />
              </span>
            </label>
            <label className="grid gap-2 text-sm text-text-secondary">
              Telefone
              <span className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input className="input-field w-full pl-10" name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="(00) 00000-0000" />
              </span>
            </label>
          </div>

          <label className="grid gap-2 text-sm text-text-secondary">
            E-mail
            <span className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input className="input-field w-full pl-10" name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
            </span>
          </label>

          <label className="grid gap-2 text-sm text-text-secondary">
            Senha
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
                onChange={(event) => setPassword(event.target.value)}
              />
            </span>
            <span className="grid gap-1 text-xs">
              <span className="h-1.5 overflow-hidden rounded-full bg-cafe-dark-700">
                <span
                  className={strengthColor + ' block h-full transition-all duration-300'}
                  style={{ width: `${Math.max(8, passwordScore * 25)}%` }}
                />
              </span>
              <span className="text-text-muted">Força da senha: {passwordStrength}</span>
            </span>
          </label>

          <label className="grid gap-2 text-sm text-text-secondary">
            Confirmar senha
            <span className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input className="input-field w-full pl-10" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} placeholder="Repita sua senha" />
            </span>
          </label>

          {error ? <p className="rounded-lg bg-cafe-red-500/10 px-4 py-2.5 text-sm text-cafe-red-500">{error}</p> : null}
          {success ? <p className="rounded-lg bg-status-success/10 px-4 py-2.5 text-sm text-status-success">{success}</p> : null}
          {devVerificationUrl ? (
            <Link href={devVerificationUrl} className="text-sm font-semibold text-cafe-orange-500 hover:text-cafe-orange-400">
              Abrir link de verificação em dev
            </Link>
          ) : null}

          <button type="submit" className="btn-primary mt-2 w-full h-11" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold text-cafe-orange-500 transition hover:text-cafe-orange-400">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
