'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ExternalLink, Loader2, Menu, Star, ThumbsUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHATSAPP } from '@/lib/servicos-data';

type FeedbackService = 'landing_page' | 'site' | 'saas' | 'pacote_completo' | 'outro';

type Feedback = {
  id: string;
  author_name: string;
  author_avatar_url: string | null;
  author_company: string | null;
  author_role: string | null;
  author_linkedin_url: string | null;
  service_type: FeedbackService;
  service_label: string;
  rating: number;
  title: string;
  body: string;
  result_metric: string | null;
  project_url: string | null;
  video_url: string | null;
  is_verified: boolean;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
};

type Stats = {
  totalApproved: number;
  avgRating: number;
  starCounts: Record<1 | 2 | 3 | 4 | 5, number>;
  starPercents: Record<1 | 2 | 3 | 4 | 5, number>;
  totalProjects: number;
  recommendedPercent: number;
};

type FormState = {
  author_name: string;
  author_email: string;
  author_avatar_url: string;
  author_company: string;
  author_role: string;
  author_linkedin_url: string;
  service_type: FeedbackService;
  rating: number;
  title: string;
  body: string;
  result_metric: string;
  project_url: string;
  video_url: string;
  consent: boolean;
};

const emptyStats: Stats = {
  totalApproved: 0,
  avgRating: 0,
  starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  starPercents: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  totalProjects: 0,
  recommendedPercent: 100,
};

const filters: Array<{ label: string; value: FeedbackService | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Landing Page', value: 'landing_page' },
  { label: 'Site Profissional', value: 'site' },
  { label: 'SaaS', value: 'saas' },
  { label: 'Pacote Completo', value: 'pacote_completo' },
];

const serviceOptions: Array<{ label: string; value: FeedbackService }> = [
  { label: 'Landing Page', value: 'landing_page' },
  { label: 'Site Profissional', value: 'site' },
  { label: 'SaaS', value: 'saas' },
  { label: 'Pacote Completo', value: 'pacote_completo' },
  { label: 'Outro', value: 'outro' },
];

const initialForm: FormState = {
  author_name: '',
  author_email: '',
  author_avatar_url: '',
  author_company: '',
  author_role: '',
  author_linkedin_url: '',
  service_type: 'landing_page',
  rating: 5,
  title: '',
  body: '',
  result_metric: '',
  project_url: '',
  video_url: '',
  consent: false,
};

function StarIcon({ filled, className }: { filled?: boolean; className?: string }) {
  return <Star className={cn('h-4 w-4', filled ? 'fill-current text-brand' : 'text-white/10', className)} />;
}

function MetricCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <span className="mb-2 block text-2xl">{icon}</span>
      <span className="block text-3xl font-black text-white">{value}</span>
      <span className="mt-1 block text-xs text-white/40">{label}</span>
    </div>
  );
}

function avatarUrl(feedback: Pick<Feedback, 'author_avatar_url' | 'author_name'>) {
  return feedback.author_avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(feedback.author_name)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function AuthorInfo({ feedback }: { feedback: Feedback }) {
  return (
    <div className="flex items-center gap-3">
      <img src={avatarUrl(feedback)} alt={feedback.author_name} className="h-11 w-11 rounded-full border border-white/10 object-cover" />
      <div>
        <p className="text-sm font-medium text-white">{feedback.author_name}</p>
        <p className="text-xs text-white/40">
          {feedback.author_role || 'Cliente'} {feedback.author_company ? `@ ${feedback.author_company}` : ''}
        </p>
      </div>
    </div>
  );
}

function HelpfulButton({ feedbackId, count }: { feedbackId: string; count: number }) {
  const [helpfulCount, setHelpfulCount] = useState(count);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function vote() {
    if (loading || voted) return;
    setLoading(true);
    const response = await fetch(`/api/feedbacks/${feedbackId}/helpful`, { method: 'POST' });
    const result = await response.json().catch(() => null);
    if (response.ok && result?.data?.helpful_count !== undefined) {
      setHelpfulCount(result.data.helpful_count);
      setVoted(true);
    } else if (response.status === 409) {
      setVoted(true);
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      className={cn('flex items-center gap-1.5 text-xs transition-colors', voted ? 'text-brand' : 'text-white/35 hover:text-brand')}
      onClick={vote}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />}
      Útil {helpfulCount}
    </button>
  );
}

function FeedbackCard({ feedback, index }: { feedback: Feedback; index: number }) {
  return (
    <article
      className="glass-card-hover mb-4 break-inside-avoid p-5 opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={avatarUrl(feedback)} alt={feedback.author_name} className="h-11 w-11 rounded-full border border-white/10 object-cover" />
            {feedback.is_verified ? (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] text-white">
                <Check className="h-3 w-3" />
              </span>
            ) : null}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{feedback.author_name}</p>
            <p className="text-xs text-white/40">
              {feedback.author_role || 'Cliente'} {feedback.author_company ? `@ ${feedback.author_company}` : ''}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.05] px-2 py-1 text-[10px] text-white/40">
          {feedback.service_label}
        </span>
      </div>

      <div className="mb-3 flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => <StarIcon key={star} filled={star <= feedback.rating} />)}
      </div>

      <h3 className="mb-2 font-semibold text-white">&ldquo;{feedback.title}&rdquo;</h3>
      <p className="mb-4 text-sm leading-relaxed text-white/60">{feedback.body}</p>

      {feedback.result_metric ? (
        <div className="mb-4 rounded-xl border border-brand/20 bg-brand/10 px-4 py-3">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-brand/60">Resultado obtido</span>
          <p className="text-sm font-medium text-brand">📈 {feedback.result_metric}</p>
        </div>
      ) : null}

      {feedback.project_url ? (
        <a href={feedback.project_url} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-brand">
          <ExternalLink className="h-3 w-3" />
          Ver projeto entregue
        </a>
      ) : null}

      <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">{formatDate(feedback.created_at)}</span>
          {feedback.author_linkedin_url ? (
            <a href={feedback.author_linkedin_url} target="_blank" rel="noopener noreferrer" className="text-white/20 transition-colors hover:text-brand">
              <span className="text-xs font-bold">in</span>
            </a>
          ) : null}
        </div>
        <HelpfulButton feedbackId={feedback.id} count={feedback.helpful_count} />
      </div>
    </article>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-sm text-white/60">
      {label}
      <input className="glass-input rounded-xl border-white/10 bg-white/[0.04] text-white" {...props} />
    </label>
  );
}

function FileInput({ label, accept, file, onChange }: { label: string; accept: string; file: File | null; onChange: (file: File | null) => void }) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.files?.[0] ?? null);
  }

  return (
    <label className="grid gap-2 text-sm text-white/60">
      {label}
      <input type="file" accept={accept} className="glass-input rounded-xl border-white/10 bg-white/[0.04] text-white file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white" onChange={handleChange} />
      {file ? <span className="text-xs text-white/35">{file.name}</span> : <span className="text-xs text-white/30">Opcional. Se não enviar foto, geramos um avatar automaticamente.</span>}
    </label>
  );
}

function SubmitFeedbackForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function validateStep(targetStep = step) {
    if (targetStep === 1) {
      if (form.author_name.trim().length < 2) return 'Informe seu nome completo.';
      if (!/^\S+@\S+\.\S+$/.test(form.author_email)) return 'Informe um e-mail válido.';
      if (form.author_linkedin_url && !form.author_linkedin_url.startsWith('http')) return 'Use uma URL completa do LinkedIn.';
    }
    if (targetStep === 2) {
      if (form.rating < 1 || form.rating > 5) return 'Escolha uma nota de 1 a 5 estrelas.';
      if (form.title.trim().length < 6) return 'Escreva um título um pouco mais claro.';
      if (form.body.trim().length < 80) return 'O depoimento precisa ter pelo menos 80 caracteres.';
      if (videoFile && videoFile.size > 50 * 1024 * 1024) return 'O vídeo deve ter no máximo 50MB.';
    }
    if (targetStep === 3 && !form.consent) return 'Confirme a autorização de publicação.';
    return null;
  }

  function nextStep() {
    const validation = validateStep();
    if (validation) {
      setError(validation);
      return;
    }
    setStep((current) => Math.min(current + 1, 3));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const validation = validateStep(3);
    if (validation) {
      setError(validation);
      return;
    }

    setSubmitting(true);
    const response = await fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSubmitting(false);

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error ?? 'Não foi possível enviar seu feedback.');
      return;
    }

    onSubmitted();
  }

  return (
    <form className="glass-card mx-auto max-w-3xl p-6 md:p-8" onSubmit={submit}>
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((item) => (
          <span key={item} className="flex items-center gap-2">
            <span className={cn('flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium transition-all duration-300', step >= item ? 'border-brand bg-brand text-white shadow-led-brand' : 'border-white/20 text-white/30')}>
              {step > item ? '✓' : item}
            </span>
            {item < 3 ? <span className={cn('h-px w-12 transition-all duration-500', step > item ? 'bg-brand' : 'bg-white/10')} /> : null}
          </span>
        ))}
      </div>

      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nome completo" value={form.author_name} onChange={(event) => update('author_name', event.target.value)} required />
          <Input label="E-mail" type="email" value={form.author_email} onChange={(event) => update('author_email', event.target.value)} required />
          <FileInput label="Foto de perfil" accept="image/*" file={avatarFile} onChange={setAvatarFile} />
          <Input label="Empresa/organização" value={form.author_company} onChange={(event) => update('author_company', event.target.value)} />
          <Input label="Cargo" value={form.author_role} onChange={(event) => update('author_role', event.target.value)} />
          <Input label="URL do LinkedIn" value={form.author_linkedin_url} onChange={(event) => update('author_linkedin_url', event.target.value)} />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-white/60">
            Qual serviço você contratou?
            <select className="glass-input rounded-xl border-white/10 bg-white/[0.04] text-white" value={form.service_type} onChange={(event) => update('service_type', event.target.value as FeedbackService)}>
              {serviceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <div className="grid gap-2">
            <span className="text-sm text-white/60">Nota</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" className="p-1" onClick={() => update('rating', star)}>
                  <StarIcon filled={star <= form.rating} className="h-7 w-7" />
                </button>
              ))}
            </div>
          </div>
          <Input label="Título do depoimento" value={form.title} onChange={(event) => update('title', event.target.value)} required />
          <label className="grid gap-2 text-sm text-white/60">
            Depoimento completo
            <textarea className="glass-input min-h-36 rounded-xl border-white/10 bg-white/[0.04] text-white" value={form.body} onChange={(event) => update('body', event.target.value)} />
            <span className="text-xs text-white/30">{form.body.length}/80 caracteres mínimos</span>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Resultado concreto obtido" value={form.result_metric} onChange={(event) => update('result_metric', event.target.value)} />
            <Input label="URL do projeto" value={form.project_url} onChange={(event) => update('project_url', event.target.value)} />
            <Input label="URL do vídeo" value={form.video_url} onChange={(event) => update('video_url', event.target.value)} />
            <FileInput label="Vídeo de depoimento (.mp4 até 50MB)" accept="video/mp4" file={videoFile} onChange={setVideoFile} />
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-6">
          <div>
            <p className="mb-3 text-sm font-semibold text-white">Preview do card</p>
            <FeedbackCard
              index={0}
              feedback={{
                id: 'preview',
                author_name: form.author_name || 'Seu nome',
                author_avatar_url: form.author_avatar_url || null,
                author_company: form.author_company || null,
                author_role: form.author_role || null,
                author_linkedin_url: form.author_linkedin_url || null,
                service_type: form.service_type,
                service_label: serviceOptions.find((option) => option.value === form.service_type)?.label ?? 'Serviço',
                rating: form.rating,
                title: form.title || 'Título do depoimento',
                body: form.body || 'Seu depoimento aparecerá aqui depois da aprovação manual.',
                result_metric: form.result_metric || null,
                project_url: form.project_url || null,
                video_url: form.video_url || null,
                is_verified: true,
                is_featured: false,
                helpful_count: 0,
                created_at: new Date().toISOString(),
              }}
            />
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-sm text-white/60">
            <input type="checkbox" className="mt-0.5 rounded border-white/20 bg-transparent text-brand focus:ring-brand/30" checked={form.consent} onChange={(event) => update('consent', event.target.checked)} />
            Confirmo que sou um cliente real e autorizo a publicação deste feedback na página pública.
          </label>
        </div>
      ) : null}

      {error ? <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

      <div className="mt-8 flex justify-between gap-3">
        <button type="button" className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/50 transition hover:text-white" onClick={() => setStep((current) => Math.max(current - 1, 1))} disabled={step === 1 || submitting}>
          Voltar
        </button>
        {step < 3 ? (
          <button type="button" className="rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-led-brand transition hover:bg-brand-light" onClick={nextStep}>
            Continuar
          </button>
        ) : (
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-led-brand transition hover:bg-brand-light" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Enviar feedback
          </button>
        )}
      </div>
    </form>
  );
}

function ThankYouState() {
  return (
    <div className="animate-scale-in py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 animate-float items-center justify-center rounded-full border border-brand/30 bg-brand/15 text-4xl shadow-led-brand">
        🙏
      </div>
      <h2 className="mb-3 text-2xl font-bold text-white">Valeu demais!</h2>
      <p className="mx-auto mb-6 max-w-sm text-white/50">
        Seu feedback foi recebido e será publicado após verificação manual. Isso leva no máximo 24h.
      </p>
      <p className="text-sm text-white/30">Você receberá um e-mail quando seu depoimento estiver no ar. ✉️</p>
    </div>
  );
}

export function FeedbacksClient() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FeedbackService | 'all'>('all');
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const featuredVideoFeedback = useMemo(() => feedbacks.find((feedback) => feedback.video_url), [feedbacks]);
  const navItems = [
    { href: '/', label: '← Loja' },
    { href: '/servicos', label: 'Serviços' },
    { href: '/servicos#provas', label: 'Projetos' },
    { href: '/feedbacks', label: 'Feedbacks' },
    { href: '#enviar', label: 'Enviar feedback' },
  ];

  const loadFeedbacks = useCallback(async ({ append = false, cursor = null }: { append?: boolean; cursor?: string | null } = {}) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '9', sort });
    if (activeFilter !== 'all') params.set('service', activeFilter);
    if (cursor) params.set('cursor', cursor);

    const response = await fetch(`/api/feedbacks?${params.toString()}`, { cache: 'no-store' });
    const result = await response.json().catch(() => null);
    const page = result?.data?.feedbacks ?? [];

    setFeedbacks((current) => (append ? [...current, ...page] : page));
    setNextCursor(result?.data?.nextCursor ?? null);
    setLoading(false);
  }, [activeFilter, sort]);

  useEffect(() => {
    fetch('/api/feedbacks/stats', { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => setStats(result?.data ?? emptyStats))
      .catch(() => setStats(emptyStats));
  }, []);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-brand/30 selection:text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-x-0 top-0 h-[620px] bg-gradient-radial from-brand/10 via-transparent to-transparent" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#050505]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand/25 to-brand/5 ring-1 ring-brand/25 shadow-led-brand transition-all duration-500 group-hover:scale-105 group-hover:ring-brand/50">
              <Image
                src="/favicon.png"
                alt="CAFÉ STORE"
                width={40}
                height={40}
                className="size-10 rounded-full object-cover drop-shadow-[0_0_8px_rgba(249,115,22,0.45)]"
                priority
              />
            </div>
            <div>
              <span className="block bg-gradient-to-r from-brand via-[#FFD000] to-[#FF3C38] bg-clip-text text-lg font-black leading-none text-transparent">
                CAFÉ STORE
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35">Feedbacks</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-medium text-white/45 transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-xl border border-brand/40 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand shadow-[0_0_18px_rgba(249,115,22,0.12)] transition-all duration-300 hover:bg-brand hover:text-white hover:shadow-led-brand md:inline-flex"
          >
            Falar comigo
          </a>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 md:hidden"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/[0.08] bg-[#080808] px-4 py-4 md:hidden">
            <div className="mx-auto grid max-w-7xl gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/[0.04] hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 rounded-xl bg-brand px-4 py-3 text-center text-sm font-bold text-white shadow-led-brand"
                onClick={() => setMobileOpen(false)}
              >
                Falar comigo
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative overflow-hidden px-4 pb-20 pt-36 text-center md:pt-44">
        <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-brand">
          O que dizem sobre o meu trabalho
        </span>
        <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl">
          Resultados reais,
          <br />
          <span className="animate-glow-brand text-brand">clientes reais</span>
        </h1>
        <p className="mx-auto mb-12 max-w-lg text-lg text-white/50">
          Cada feedback aqui é verificado manualmente. Sem bots, sem texto gerado, sem fake.
        </p>

        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard icon="⭐" value={stats.avgRating || '0.0'} label="Nota média" />
          <MetricCard icon="✅" value={stats.totalApproved} label="Feedbacks verificados" />
          <MetricCard icon="🏆" value={`${stats.recommendedPercent}%`} label="Recomendariam" />
          <MetricCard icon="🚀" value={stats.totalProjects} label="Projetos entregues" />
        </div>
      </section>

      <section className="glass-card mx-auto mb-12 max-w-2xl p-8">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="flex-shrink-0 text-center">
            <span className="text-7xl font-bold text-white">{stats.avgRating || '0.0'}</span>
            <div className="my-2 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => <StarIcon key={star} filled className="h-5 w-5" />)}
            </div>
            <span className="text-sm text-white/40">de 5 estrelas</span>
          </div>
          <div className="w-full flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <span className="w-4 text-sm text-white/50">{star}</span>
                <StarIcon filled className="h-3 w-3" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-brand transition-all duration-1000 ease-out" style={{ width: `${stats.starPercents[star as 1 | 2 | 3 | 4 | 5]}%` }} />
                </div>
                <span className="w-8 text-xs text-white/30">{stats.starCounts[star as 1 | 2 | 3 | 4 | 5]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredVideoFeedback ? (
        <section className="mb-12 px-4">
          <h2 className="mb-4 text-center text-xs uppercase tracking-widest text-white/40">Depoimento em vídeo</h2>
          <div className="relative mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-brand/50 via-brand/20 to-brand/50 p-[1px] shadow-led-brand">
            <div className="glass-card overflow-hidden rounded-2xl">
              <video controls className="w-full rounded-t-2xl">
                <source src={featuredVideoFeedback.video_url ?? undefined} />
              </video>
              <div className="p-6">
                <AuthorInfo feedback={featuredVideoFeedback} />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition-all duration-200',
                activeFilter === filter.value
                  ? 'border-brand bg-brand text-white shadow-led-brand'
                  : 'border-white/10 text-white/50 hover:border-brand/40 hover:text-white/80',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mb-6 flex justify-end">
          <select className="glass-input rounded-xl border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="recent">Mais recentes</option>
            <option value="rating">Melhor avaliação</option>
            <option value="helpful">Mais úteis</option>
          </select>
        </div>

        {feedbacks.length > 0 ? (
          <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
            {feedbacks.map((feedback, index) => <FeedbackCard key={feedback.id} feedback={feedback} index={index} />)}
          </div>
        ) : (
          <div className="glass-card mx-auto max-w-xl p-10 text-center">
            <p className="text-lg font-semibold text-white">Ainda não há feedbacks aprovados para este filtro.</p>
            <p className="mt-2 text-sm text-white/45">Os novos depoimentos aparecem aqui após moderação manual.</p>
          </div>
        )}

        {nextCursor ? (
          <div className="mt-10 text-center">
            <button type="button" onClick={() => loadFeedbacks({ append: true, cursor: nextCursor })} className="glass-button border border-white/10 px-8 py-3 text-white/60 hover:border-brand/30 hover:text-white" disabled={loading}>
              {loading ? 'Carregando...' : 'Carregar mais feedbacks'}
            </button>
          </div>
        ) : null}
      </section>

      <section id="enviar" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">Sua vez</span>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Deixe seu feedback</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/45">Seu depoimento ajuda outros clientes a decidirem com segurança e valoriza o projeto que construímos juntos.</p>
        </div>
        {submitted ? <ThankYouState /> : <SubmitFeedbackForm onSubmitted={() => setSubmitted(true)} />}
      </section>
    </main>
  );
}
