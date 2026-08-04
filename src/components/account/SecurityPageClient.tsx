'use client';

import { signOut } from 'next-auth/react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Circle, Copy, Eye, EyeOff, Loader2, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type PasswordChecks = {
  length: boolean;
  longLength: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
};

type PasswordStrength = {
  score: number;
  label: string;
  color: string;
  checks: PasswordChecks;
};

function evaluatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    longLength: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (checks.length) score += 1;
  if (checks.longLength) score += 1;
  if (checks.uppercase) score += 1;
  if (checks.number) score += 1;
  if (checks.special) score += 1;

  const normalized = Math.min(4, Math.floor(score * 4 / 5));

  const levels = [
    { label: 'Muito fraca', color: '#EF4444' },
    { label: 'Fraca', color: '#F97316' },
    { label: 'Razoável', color: '#EAB308' },
    { label: 'Forte', color: '#22C55E' },
    { label: 'Muito forte', color: '#10B981' },
  ];

  return { score: normalized, checks, ...levels[normalized] };
}

const strengthChecksList: { key: keyof PasswordChecks; label: string }[] = [
  { key: 'length', label: 'Mínimo 8 caracteres' },
  { key: 'longLength', label: 'Pelo menos 12 caracteres (recomendado)' },
  { key: 'uppercase', label: 'Letra maiúscula' },
  { key: 'number', label: 'Número' },
  { key: 'special', label: 'Caractere especial (!@#$...)' },
];

type TwoFactorStatus = {
  enabled: boolean;
  activatedAt: string | null;
};

export function SecurityPageClient() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [strength, setStrength] = useState<PasswordStrength>(() => evaluatePasswordStrength(''));
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [twoFactor, setTwoFactor] = useState<TwoFactorStatus>({ enabled: false, activatedAt: null });
  const [tfLoading, setTfLoading] = useState(true);
  const [tfModalOpen, setTfModalOpen] = useState(false);
  const [tfStep, setTfStep] = useState<'setup' | 'verify' | 'recovery'>('setup');
  const [tfSecret, setTfSecret] = useState('');
  const [tfOtpauthUrl, setTfOtpauthUrl] = useState('');
  const [tfQrDataUrl, setTfQrDataUrl] = useState('');
  const [tfPin, setTfPin] = useState<string[]>(Array(6).fill(''));
  const [tfVerifying, setTfVerifying] = useState(false);
  const [tfError, setTfError] = useState('');
  const [tfRecoveryCodes, setTfRecoveryCodes] = useState<string[]>([]);
  const [tfDisableOpen, setTfDisableOpen] = useState(false);
  const [tfDisablePassword, setTfDisablePassword] = useState('');
  const [tfDisabling, setTfDisabling] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newPasswordRef = useRef<HTMLInputElement>(null);

  const canSubmit = currentPassword && newPassword && confirmPassword && newPassword === confirmPassword && strength.score >= 1;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/2fa/status');
        const json = await res.json();
        if (json.success) setTwoFactor(json.data);
      } catch {
        // ignore
      } finally {
        setTfLoading(false);
      }
    }
    void load();
  }, []);

  useEffect(() => {
    if (!tfOtpauthUrl) return;
    async function generate() {
      try {
        const { default: QRCode } = await import('qrcode');
        const url = await QRCode.toDataURL(tfOtpauthUrl, { width: 240, margin: 2, color: { dark: '#FF6B00', light: '#111111' } });
        setTfQrDataUrl(url);
      } catch {
        // ignore
      }
    }
    void generate();
  }, [tfOtpauthUrl]);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setSuccessState(false);

    const res = await fetch('/api/account/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error ?? 'Nao foi possivel alterar a senha.');
      showToast(json.error ?? 'Nao foi possivel alterar a senha.', 'error');
      return;
    }

    setSuccessState(true);
    setMessage('Senha alterada com sucesso');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStrength(evaluatePasswordStrength(''));
    showToast('Senha alterada com sucesso!', 'success');
    setTimeout(() => setSuccessState(false), 2000);
  }

  async function handleDeleteAccount() {
    const res = await fetch('/api/user/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: deletePassword }),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error ?? 'Nao foi possivel excluir a conta.');
      showToast(json.error ?? 'Nao foi possivel excluir a conta.', 'error');
      return;
    }
    await signOut({ callbackUrl: '/' });
  }

  async function handleSetup2FA() {
    setTfModalOpen(true);
    setTfStep('setup');
    setTfError('');

    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const json = await res.json();
      if (!json.success) {
        setTfError(json.error);
        return;
      }
      setTfSecret(json.data.secret);
      setTfOtpauthUrl(json.data.otpauth_url);
      setTfStep('verify');
    } catch {
      setTfError('Erro ao iniciar configuracao 2FA.');
    }
  }

  function handlePinChange(index: number, value: string) {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newPin = [...Array(6)].map((_, i) => digits[i] ?? '');
      setTfPin(newPin);
      const nextFocus = Math.min(digits.length, 5);
      pinRefs.current[nextFocus]?.focus();
      return;
    }

    if (!/^\d?$/.test(value)) return;

    const newPin = [...tfPin];
    newPin[index] = value;
    setTfPin(newPin);

    if (value && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  }

  function handlePinKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !tfPin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  }

  async function handleVerify2FA() {
    const token = tfPin.join('');
    if (token.length !== 6) {
      setTfError('Digite o codigo de 6 digitos.');
      return;
    }

    setTfVerifying(true);
    setTfError('');

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();

      if (!json.success) {
        setTfError(json.error);
        setTfPin(Array(6).fill(''));
        pinRefs.current[0]?.focus();
        return;
      }

      setTfRecoveryCodes(json.data.recoveryCodes);
      setTfStep('recovery');
      setTwoFactor({ enabled: true, activatedAt: new Date().toISOString() });
    } catch {
      setTfError('Erro ao verificar codigo.');
    } finally {
      setTfVerifying(false);
    }
  }

  async function handleDisable2FA() {
    setTfDisabling(true);
    setTfError('');

    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: tfDisablePassword }),
      });
      const json = await res.json();

      if (!json.success) {
        setTfError(json.error);
        showToast(json.error, 'error');
        return;
      }

      setTwoFactor({ enabled: false, activatedAt: null });
      setTfDisableOpen(false);
      setTfDisablePassword('');
      showToast('2FA desativado com sucesso.', 'success');
    } catch {
      setTfError('Erro ao desativar 2FA.');
    } finally {
      setTfDisabling(false);
    }
  }

  function handleCopyRecoveryCodes() {
    navigator.clipboard.writeText(tfRecoveryCodes.join('\n'));
    showToast('Codigos copiados!', 'success');
  }

  function handleDownloadRecoveryCodes() {
    const blob = new Blob([tfRecoveryCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cafe-store-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function closeModal() {
    setTfModalOpen(false);
    setTfStep('setup');
    setTfPin(Array(6).fill(''));
    setTfError('');
    setTfRecoveryCodes([]);
  }

  return (
    <div className="grid gap-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h2 className="text-2xl font-bold text-white">Segurança</h2>
        <p className="mt-1 text-sm text-zinc-500">Gerencie senha, acesso e encerramento da conta.</p>
      </motion.div>

      <motion.form
        onSubmit={handleChangePassword}
        className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-[12px] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[inset_0_0_40px_rgba(255,107,0,0.05)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h3 className="flex items-center gap-2 font-semibold text-white"><Shield className="size-4 text-brand" /> Alterar senha</h3>
        <div className="mt-5 grid gap-4">
          <div className="relative">
            <input
              className="input-field w-full pr-10 transition-all duration-200 ease-out focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,107,0,0.15)]"
              type={showCurrent ? 'text' : 'password'}
              placeholder="Senha atual"
              value={currentPassword}
              autoComplete="current-password"
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              onClick={() => setShowCurrent(!showCurrent)}
              aria-label={showCurrent ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showCurrent ? <EyeOff className="size-4 transition duration-150" /> : <Eye className="size-4 transition duration-150" />}
            </button>
          </div>

          <div>
            <div className="relative">
              <input
                ref={newPasswordRef}
                className={cn(
                  'input-field w-full pr-10 transition-all duration-200 ease-out focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,107,0,0.15)]',
                )}
                type={showNew ? 'text' : 'password'}
                placeholder="Nova senha"
                value={newPassword}
                autoComplete="new-password"
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setStrength(evaluatePasswordStrength(e.target.value));
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showNew ? <EyeOff className="size-4 transition duration-150" /> : <Eye className="size-4 transition duration-150" />}
              </button>
            </div>

            {newPassword ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((segment) => (
                    <div
                      key={segment}
                      className="h-1 flex-1 rounded-[2px] transition-all duration-[400ms] ease-out"
                      style={{
                        backgroundColor: segment <= strength.score ? strength.color : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-xs font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </p>

                <div className="mt-3 grid gap-1.5">
                  {strengthChecksList.map((check) => {
                    const passed = strength.checks[check.key];
                    return (
                      <div key={check.key} className="flex items-center gap-2 text-xs">
                        <span
                          className="inline-flex items-center justify-center"
                          style={{
                            animation: passed ? 'checkPop 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : undefined,
                          }}
                        >
                          {passed ? (
                            <Check className="size-3.5 text-green-400" />
                          ) : (
                            <Circle className="size-3.5 text-zinc-600" />
                          )}
                        </span>
                        <span className={passed ? 'text-zinc-300' : 'text-zinc-500'}>{check.label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </div>

          <div className="relative">
            <input
              className={cn(
                'input-field w-full pr-10 transition-all duration-200 ease-out',
                confirmPassword && newPassword !== confirmPassword
                  ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
                  : 'focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,107,0,0.15)]',
              )}
              style={{
                animation: confirmPassword && newPassword !== confirmPassword ? 'shake 400ms ease' : undefined,
              }}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showConfirm ? <EyeOff className="size-4 transition duration-150" /> : <Eye className="size-4 transition duration-150" />}
            </button>
          </div>

          {confirmPassword && newPassword !== confirmPassword ? (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-red-400"
              role="alert"
            >
              As senhas nao conferem.
            </motion.p>
          ) : null}

          {error ? (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-red-400"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </motion.p>
          ) : null}

          {message ? (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-green-400"
              role="status"
            >
              {message}
            </motion.p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition-all duration-200 ease-out',
              successState ? 'bg-[#22C55E]' : loading ? 'bg-[#FF6B00] opacity-80' : 'bg-[#FF6B00] hover:bg-[#E55A00] hover:-translate-y-0.5 disabled:bg-[rgba(255,107,0,0.3)] disabled:cursor-not-allowed disabled:translate-y-0',
            )}
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : successState ? (
              <Check className="size-4" />
            ) : null}
            {successState ? 'Senha alterada!' : loading ? 'Alterando...' : 'Alterar senha'}
          </button>
        </div>
      </motion.form>

      <motion.section
        className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-[12px] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[inset_0_0_40px_rgba(255,107,0,0.05)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-6 shrink-0 text-brand" />
            <div>
              <h3 className="font-semibold text-white">Autenticação em dois fatores</h3>
              <p className="mt-1 text-sm text-zinc-400">Adicione uma camada extra de segurança à sua conta</p>
            </div>
          </div>
          {!tfLoading && twoFactor.enabled ? (
            <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
              <span className="size-1.5 rounded-full bg-green-400" />
              Ativo
            </span>
          ) : null}
        </div>

        {tfLoading ? (
          <div className="mt-4 h-12 animate-pulse rounded-xl bg-white/[0.06]" />
        ) : twoFactor.enabled ? (
          <div className="mt-4 grid gap-4">
            <p className="text-sm text-zinc-500">
              Ativado em {new Date(twoFactor.activatedAt!).toLocaleDateString('pt-BR')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="danger"
                onClick={() => setTfDisableOpen(true)}
              >
                Desativar 2FA
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              {[
                'Proteção mesmo se sua senha vazar',
                'Compatível com Google Authenticator e Authy',
                'Código muda a cada 30 segundos',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-3.5 shrink-0 text-green-400" />
                  {benefit}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSetup2FA}
                className="inline-flex items-center gap-2 rounded-xl border border-brand/40 px-4 py-2.5 text-sm font-semibold text-brand transition-all duration-200 hover:bg-brand/10 hover:-translate-y-0.5"
              >
                Ativar 2FA
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-2.5 py-1 text-xs font-semibold text-green-400">
                <span className="size-1.5 rounded-full bg-green-400" />
                Recomendado
              </span>
            </div>
          </div>
        )}
      </motion.section>

      <motion.section
        className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 transition-all duration-200 ease-out hover:-translate-y-0.5"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h3 className="font-semibold text-red-300">Excluir conta</h3>
        <p className="mt-2 text-sm text-zinc-400">Esta acao e irreversivel. Todos os seus dados serao desativados.</p>
        <Button variant="danger" className="mt-4" onClick={() => setDeleteOpen(true)}>Excluir minha conta</Button>
      </motion.section>

      <AnimatePresence>
        {deleteOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-950 p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              <h3 className="text-lg font-semibold text-white">Confirmar exclusão</h3>
              <p className="mt-2 text-sm text-zinc-400">Esta ação é irreversível. Todos os seus dados serão removidos.</p>
              <input
                className="input-field mt-4 w-full"
                type="password"
                placeholder="Senha atual"
                value={deletePassword}
                autoComplete="current-password"
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
              <div className="mt-6 flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                <Button variant="danger" className="flex-1" disabled={!deletePassword} onClick={() => void handleDeleteAccount()}>
                  Confirmar exclusão
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {tfModalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="w-full max-w-[480px] rounded-2xl border border-brand/20 bg-[#111111] p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              {tfStep === 'setup' ? (
                <div className="grid gap-4 text-center">
                  <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand/10 text-brand">
                    <Loader2 className="size-8 animate-spin" />
                  </div>
                  <p className="text-sm text-zinc-400">Preparando configuração...</p>
                </div>
              ) : null}

              {tfStep === 'verify' && tfQrDataUrl ? (
                <div className="grid gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Configurar 2FA</h3>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white"
                      onClick={closeModal}
                      aria-label="Fechar"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div className="grid justify-items-center gap-3">
                    <div className="rounded-xl border-2 border-brand/30 p-3">
                      <img src={tfQrDataUrl} alt="QR Code para configurar 2FA" className="size-[180px]" />
                    </div>
                    <p className="text-center text-sm text-zinc-400">
                      Escaneie com <strong className="text-white">Google Authenticator</strong> ou <strong className="text-white">Authy</strong>
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <p className="text-xs text-zinc-500">Ou insira o código manualmente:</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <code className="font-mono text-sm tracking-[0.25em] text-zinc-300">
                        {tfSecret.match(/.{1,4}/g)?.join(' ') ?? tfSecret}
                      </code>
                      <button
                        type="button"
                        className="shrink-0 text-xs font-semibold text-brand hover:text-orange-400"
                        onClick={() => {
                          navigator.clipboard.writeText(tfSecret);
                          showToast('Código copiado!', 'success');
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <p className="text-sm font-medium text-white">Digite o código de verificação</p>
                    <div className="flex justify-center gap-2">
                      {tfPin.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { pinRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          aria-label={`Dígito ${i + 1} de 6`}
                          className={cn(
                            'size-[48px] rounded-[10px] border bg-white/[0.04] text-center text-2xl font-bold text-white outline-none transition-all duration-150',
                            tfError ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : digit
                              ? 'border-brand bg-brand/10 shadow-[0_0_0_3px_rgba(255,107,0,0.15)]'
                              : 'border-white/[0.08] focus:scale-105 focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,107,0,0.15)]',
                          )}
                          onChange={(e) => handlePinChange(i, e.target.value)}
                          onKeyDown={(e) => handlePinKeyDown(i, e)}
                          onPaste={(e) => {
                            if (i !== 0) return;
                            e.preventDefault();
                            const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                            const newPin = data.split('').concat(Array(6).fill('')).slice(0, 6);
                            setTfPin(newPin);
                            const focus = Math.min(data.length, 5);
                            pinRefs.current[focus]?.focus();
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {tfError ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-sm text-red-400"
                      aria-live="assertive"
                    >
                      {tfError}
                    </motion.p>
                  ) : null}

                  <button
                    type="button"
                    disabled={tfPin.join('').length !== 6 || tfVerifying}
                    onClick={handleVerify2FA}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#E55A00] hover:-translate-y-0.5 disabled:bg-[rgba(255,107,0,0.3)] disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {tfVerifying ? (
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : null}
                    {tfVerifying ? 'Verificando...' : 'Verificar e ativar'}
                  </button>
                </div>
              ) : null}

              {tfStep === 'recovery' ? (
                <div className="grid gap-5">
                  <div className="text-center">
                    <motion.div
                      className="mx-auto mb-3 grid size-16 place-items-center rounded-2xl bg-green-500/10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <Shield className="size-8 text-green-400" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-white">2FA ativado com sucesso!</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      Sua conta agora está protegida com autenticação em dois fatores.
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                      <p className="text-xs leading-5 text-amber-300">
                        Guarde estes códigos em local seguro. Cada código só pode ser usado uma vez.
                        Sem eles, você poderá perder acesso à sua conta se perder o dispositivo.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {tfRecoveryCodes.map((code, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-mono text-xs text-zinc-300"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCopyRecoveryCodes}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06]"
                    >
                      <Copy className="size-4" />
                      Copiar todos
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadRecoveryCodes}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06]"
                    >
                      Baixar .txt
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#E55A00]"
                  >
                    Concluir
                  </button>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 2FA Disable Confirm */}
      <AnimatePresence>
        {tfDisableOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#111111] p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              <h3 className="text-lg font-bold text-white">Desativar 2FA</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Tem certeza? Sua conta perderá a proteção extra.
              </p>
              <input
                className="input-field mt-4 w-full"
                type="password"
                placeholder="Senha atual"
                value={tfDisablePassword}
                autoComplete="current-password"
                onChange={(e) => setTfDisablePassword(e.target.value)}
              />
              {tfError ? <p className="mt-2 text-sm text-red-400">{tfError}</p> : null}
              <div className="mt-6 flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setTfDisableOpen(false)} disabled={tfDisabling}>
                  Cancelar
                </Button>
                <Button variant="danger" className="flex-1" disabled={!tfDisablePassword || tfDisabling} loading={tfDisabling} onClick={() => void handleDisable2FA()}>
                  Desativar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border border-white/[0.08] bg-zinc-950 px-4 py-3 shadow-2xl"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '120%', opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            
            style={{
              borderLeft: toast.type === 'success' ? '4px solid #22C55E' : '4px solid #EF4444',
            }}
          >
            {toast.type === 'success' ? (
              <Check className="size-4 shrink-0 text-green-400" />
            ) : (
              <X className="size-4 shrink-0 text-red-400" />
            )}
            <p className="text-sm font-medium text-white">{toast.message}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
