'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Flame, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="relative max-w-md w-full">
        <div className="absolute -inset-12 -z-10 blur-3xl opacity-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-300" />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          <div className="text-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 }} className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-orange-600 to-orange-500 shadow-[0_8px_30px_rgba(249,115,22,0.12)]">
              <Flame className="h-7 w-7 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white">Recuperar senha</h1>
            <p className="mt-2 text-sm text-white/60">Informe seu e‑mail e enviaremos um link de redefinição.</p>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit} aria-live="polite">
            <label className="relative block">
              <span className="text-sm font-medium text-white/70">E-mail</span>
              <span className="relative mt-2 block">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="voce@exemplo.com"
                  className="w-full rounded-xl border border-white/20 bg-white/6 px-4 py-3 pl-11 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                />
              </span>
            </label>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : null}
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>

              <AnimatePresence>
                {error ? (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="rounded-lg border border-red-400/20 bg-red-600/10 px-4 py-2 text-sm text-red-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-300" />
                    <span>{error}</span>
                  </motion.div>
                ) : null}

                {message ? (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="rounded-lg border border-emerald-400/20 bg-emerald-600/10 px-4 py-2 text-sm text-emerald-100 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-200" />
                    <span>{message}</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {devResetUrl ? (
                <Link href={devResetUrl} className="text-sm font-semibold text-orange-300 hover:text-orange-200">
                  Abrir link de reset (dev)
                </Link>
              ) : null}

              <div className="mt-2 text-center text-sm">
                <Link href="/login" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-transform group">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Voltar para o login
                </Link>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
