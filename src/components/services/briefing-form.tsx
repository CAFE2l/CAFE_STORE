'use client';

import { useEffect, useMemo, useState } from 'react';
import { type FieldPath, type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { briefingSchema, type BriefingInput } from '@/lib/validations/project-briefing';
import { createProjectBriefing } from '@/lib/actions/project-briefing';
import { getServiceName } from '@/lib/services';
import { SERVICES, normalizeServiceKey } from '@/data/services';
import { BriefingStepPersonal } from '@/components/services/briefing-step-personal';
import { BriefingStepProject } from '@/components/services/briefing-step-project';
import { BriefingStepTechnical } from '@/components/services/briefing-step-technical';
import { BriefingReview } from '@/components/services/briefing-review';
import { WhatsAppButton } from '@/components/services/whatsapp-button';

type Props = {
  serviceSlug: string;
};

const STEPS = [
  { title: 'Dados pessoais', description: 'Suas informações de contato' },
  { title: 'Dados do projeto', description: 'Detalhes sobre o que precisa' },
  { title: 'Detalhes técnicos', description: 'Funcionalidades e requisitos' },
  { title: 'Revisão', description: 'Confirme os dados e envie' },
];

export function BriefingForm({ serviceSlug }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [briefingId, setBriefingId] = useState('');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const initialService = useMemo(() => normalizeServiceKey(serviceSlug) ?? 'landing-pages', [serviceSlug]);
  const serviceName = getServiceName(initialService);

  const form = useForm<BriefingInput>({
    resolver: zodResolver(briefingSchema) as Resolver<BriefingInput>,
    defaultValues: {
      name: '',
      email: '',
      whatsapp: '',
      companyName: '',
      serviceType: initialService,
      serviceName,
      budget: '',
      deadline: '',
      projectDescription: '',
      mainGoal: '',
      targetAudience: '',
      references: '',
      desiredFeatures: [],
      hasDomain: undefined,
      hasHosting: undefined,
      hasBranding: undefined,
      preferredContact: undefined,
      extraNotes: '',
    },
  });

  const watchedService = form.watch('serviceType');

  useEffect(() => {
    const normalized = normalizeServiceKey(serviceSlug) ?? 'landing-pages';
    form.setValue('serviceType', normalized, { shouldDirty: false, shouldValidate: true });
    form.setValue('serviceName', SERVICES[normalized].label, { shouldDirty: false });
    form.setValue('budget', '', { shouldDirty: false });
    form.setValue('deadline', '', { shouldDirty: false });
    void form.trigger(['serviceType', 'budget', 'deadline']);
  }, [form, serviceSlug]);

  async function handleNext() {
    const fields = getStepFields(step);
    const isValid = await form.trigger(fields, { shouldFocus: true });
    if (isValid) {
      setCompletedSteps((current) => (current.includes(step) ? current : [...current, step]));
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    const isValid = await form.trigger(undefined, { shouldFocus: true });
    if (!isValid) return;

    setSubmitting(true);
    try {
      const data = form.getValues();
      const result = await createProjectBriefing(data);

      if (result.ok && result.whatsappUrl && result.briefingId) {
        setWhatsappUrl(result.whatsappUrl);
        setBriefingId(result.briefingId);
        setSubmitted(true);
      } else {
        console.error('Submission error:', result.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleStepClick(nextStep: number) {
    if (nextStep === step) return;
    if (completedSteps.includes(nextStep) || nextStep < step) {
      setStep(nextStep);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20">
          <Check className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Briefing enviado com sucesso!</h2>
        <p className="mt-3 text-white/50">
          Seu briefing foi salvo. Agora você pode enviar pelo WhatsApp ou continuar para o checkout.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <WhatsAppButton href={whatsappUrl} />

          <button
            type="button"
            onClick={() => router.push(`/servicos/${serviceSlug}/checkout?briefingId=${briefingId}`)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-white/70 transition-all hover:border-white/20 hover:text-white"
          >
            Continuar para checkout
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <div className="flex items-center justify-between gap-4">
          {STEPS.map((s, i) => {
            const isComplete = completedSteps.includes(i);
            const canClick = i !== step && (isComplete || i < step);
            const isFuture = i > step && !isComplete;

            return (
            <button
              type="button"
              key={s.title}
              onClick={() => handleStepClick(i)}
              disabled={!canClick}
              className={`flex flex-1 items-center gap-2 text-left transition ${
                i === step ? 'cursor-default' : isFuture ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i <= step
                  ? 'bg-brand text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                  : 'border border-white/10 bg-white/[0.03] text-white/30'
              }`}>
                {i + 1}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className={`text-xs font-semibold ${i <= step ? 'text-white' : 'text-white/30'}`}>{s.title}</p>
              </div>
              {i < STEPS.length - 1 ? (
                <div className={`ml-auto h-px flex-1 ${i < step ? 'bg-brand/50' : 'bg-white/10'}`} />
              ) : null}
            </button>
          );
          })}
        </div>

        <div className="mt-2 text-center sm:hidden">
          <p className="text-sm font-medium text-white/70">{STEPS[step].title}</p>
          <p className="text-xs text-white/40">{STEPS[step].description}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
        {step === 0 && <BriefingStepPersonal form={form} />}
        {step === 1 && <BriefingStepProject form={form} />}
        {step === 2 && <BriefingStepTechnical form={form} serviceSlug={watchedService} />}
        {step === 3 && <BriefingReview data={form.getValues()} serviceName={getServiceName(watchedService)} />}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={step === 0 ? () => router.back() : handleBack}
          className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white/60 transition-all hover:border-white/20 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 0 ? 'Voltar' : 'Anterior'}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-white shadow-led-brand transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_30px_8px_rgba(249,115,22,0.35)] active:scale-[0.98]"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-white shadow-led-brand transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_30px_8px_rgba(249,115,22,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirmar e enviar
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function getStepFields(step: number): FieldPath<BriefingInput>[] {
  switch (step) {
    case 0:
      return ['name', 'email', 'whatsapp'];
    case 1:
      return ['companyName', 'serviceType', 'budget', 'deadline', 'projectDescription', 'mainGoal', 'targetAudience', 'references'];
    case 2:
      return [
        'desiredFeatures', 'hasDomain', 'hasHosting', 'hasBranding', 'preferredContact', 'extraNotes',
        'landingPageGoal', 'landingPageProduct', 'landingPageNeedsForm', 'landingPageNeedsWhatsapp',
        'landingPageNeedsLeadCapture', 'landingPageNeedsEmailMarketing',
        'sitePagesCount', 'siteNeedsAdmin', 'siteNeedsBlog', 'siteNeedsSeo',
        'appNeedsLogin', 'appNeedsAdmin', 'appNeedsDatabase', 'appNeedsApi', 'appNeedsPayments',
        'appUserTypesCount', 'appMainFeatures',
      ];
    default:
      return [];
  }
}
