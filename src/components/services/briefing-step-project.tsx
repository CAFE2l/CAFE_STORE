'use client';

import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { UseFormReturn } from 'react-hook-form';
import { SERVICES, SERVICE_KEYS, isServiceKey } from '@/data/services';
import type { BriefingInput } from '@/lib/validations/project-briefing';
import { FieldErrorMessage } from '@/components/services/field-error-message';

type Props = {
  form: UseFormReturn<BriefingInput>;
};

export function BriefingStepProject({ form }: Props) {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

  const selectedService = watch('serviceType');
  const projectDescription = watch('projectDescription') ?? '';
  const previousServiceRef = useRef<string | null>(null);

  const service = useMemo(() => {
    return isServiceKey(selectedService) ? SERVICES[selectedService] : SERVICES['landing-pages'];
  }, [selectedService]);

  useEffect(() => {
    if (!isServiceKey(selectedService)) return;

    setValue('serviceName', SERVICES[selectedService].label, { shouldDirty: false });

    if (previousServiceRef.current && previousServiceRef.current !== selectedService) {
      setValue('budget', '', { shouldDirty: true, shouldValidate: true });
      setValue('deadline', '', { shouldDirty: true, shouldValidate: true });
      void trigger(['budget', 'deadline']);
    }

    previousServiceRef.current = selectedService;
  }, [selectedService, setValue, trigger]);

  const serviceRegistration = register('serviceType');
  const descriptionCount = projectDescription.length;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-bold text-white">Dados do projeto</h2>
        <p className="mt-1 text-sm text-white/40">Informações sobre o serviço e orçamento</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Empresa/Marca
          </label>
          <input
            {...register('companyName')}
            placeholder="Nome da sua marca ou empresa"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Serviço escolhido <span className="text-brand">*</span>
          </label>
          <select
            {...serviceRegistration}
            onChange={(event) => {
              void serviceRegistration.onChange(event);
              const nextService = event.target.value;
              if (isServiceKey(nextService)) {
                setValue('serviceName', SERVICES[nextService].label, { shouldDirty: true });
                setValue('budget', '', { shouldDirty: true, shouldValidate: true });
                setValue('deadline', '', { shouldDirty: true, shouldValidate: true });
                void trigger(['serviceType', 'budget', 'deadline']);
              }
            }}
            className={`h-12 w-full rounded-xl border bg-[#0a0a0a] px-4 text-sm text-white outline-none transition focus:border-brand/50 ${
              errors.serviceType ? 'border-red-500' : 'border-white/10'
            }`}
          >
            <option value="">Selecione o serviço desejado</option>
            {SERVICE_KEYS.map((serviceKey) => (
              <option key={serviceKey} value={serviceKey}>
                {SERVICES[serviceKey].label}
              </option>
            ))}
          </select>
          <FieldErrorMessage message={errors.serviceType?.message} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Orçamento aproximado <span className="text-brand">*</span>
          </label>
          <select
            {...register('budget')}
            className={`h-12 w-full rounded-xl border bg-[#0a0a0a] px-4 text-sm text-white outline-none transition focus:border-brand/50 ${
              errors.budget ? 'border-red-500' : 'border-white/10'
            }`}
          >
            <option value="">Selecione a faixa...</option>
            <AnimatePresence mode="popLayout">
              {service.orcamentos.map((opt) => (
                <motion.option
                  key={`${selectedService}-${opt}`}
                  value={opt}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {opt}
                </motion.option>
              ))}
            </AnimatePresence>
          </select>
          {selectedService === 'saas-webapp' ? (
            <p className="mt-1.5 text-xs text-white/45">💡 Projetos SaaS são orçados sob medida. Indique sua faixa estimada.</p>
          ) : null}
          <FieldErrorMessage message={errors.budget?.message} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Prazo desejado <span className="text-brand">*</span>
          </label>
          <select
            {...register('deadline')}
            className={`h-12 w-full rounded-xl border bg-[#0a0a0a] px-4 text-sm text-white outline-none transition focus:border-brand/50 ${
              errors.deadline ? 'border-red-500' : 'border-white/10'
            }`}
          >
            <option value="">Selecione o prazo...</option>
            <AnimatePresence mode="popLayout">
              {service.prazos.map((opt) => (
                <motion.option
                  key={`${selectedService}-${opt}`}
                  value={opt}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {opt}
                </motion.option>
              ))}
            </AnimatePresence>
          </select>
          <FieldErrorMessage message={errors.deadline?.message} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-white/70">
            Descrição do projeto <span className="text-brand">*</span>
          </label>
          <div className="relative">
            <textarea
              {...register('projectDescription')}
              rows={4}
              maxLength={500}
              placeholder="Descreva o seu projeto em detalhes. Quanto mais informações, melhor será o entendimento do escopo."
              className={`w-full resize-none rounded-xl border bg-white/[0.04] px-4 py-3 pb-8 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)] ${
                errors.projectDescription ? 'border-red-500' : 'border-white/10'
              }`}
            />
            <span className={`pointer-events-none absolute bottom-3 right-4 text-xs ${
              descriptionCount > 450 ? 'text-orange-400' : 'text-zinc-500'
            }`}>
              {descriptionCount} / 500
            </span>
          </div>
          <FieldErrorMessage message={errors.projectDescription?.message} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-white/70">
            Objetivo principal do projeto
          </label>
          <textarea
            {...register('mainGoal')}
            rows={3}
            placeholder="Qual o principal objetivo? Ex: vender mais, captar leads, automatizar processos..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-white/70">
            Público-alvo
          </label>
          <input
            {...register('targetAudience')}
            placeholder="Ex: empreendedores digitais, pequenas empresas, profissionais liberais..."
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-white/70">
            Referências visuais / Sites de inspiração
          </label>
          <textarea
            {...register('references')}
            rows={2}
            placeholder="Links de sites que você gosta, referências de design, exemplos visuais..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
          />
        </div>
      </div>
    </div>
  );
}
