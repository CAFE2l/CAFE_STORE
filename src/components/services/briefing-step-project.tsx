'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { BriefingInput } from '@/lib/validations/project-briefing';
import { budgetOptions, deadlineOptions } from '@/lib/validations/project-briefing';

type Props = {
  form: UseFormReturn<BriefingInput>;
  serviceName: string;
};

export function BriefingStepProject({ form, serviceName }: Props) {
  const { register, formState: { errors } } = form;

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
            Serviço escolhido
          </label>
          <input
            value={serviceName}
            disabled
            className="h-12 w-full cursor-not-allowed rounded-xl border border-brand/20 bg-brand/[0.06] px-4 text-sm font-medium text-brand outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Orçamento aproximado <span className="text-brand">*</span>
          </label>
          <select
            {...register('budget')}
            className="h-12 w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 text-sm text-white outline-none transition focus:border-brand/50"
          >
            <option value="">Selecione...</option>
            {budgetOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.budget ? (
            <p className="mt-1.5 text-xs text-red-400">{errors.budget.message}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Prazo desejado <span className="text-brand">*</span>
          </label>
          <select
            {...register('deadline')}
            className="h-12 w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 text-sm text-white outline-none transition focus:border-brand/50"
          >
            <option value="">Selecione...</option>
            {deadlineOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.deadline ? (
            <p className="mt-1.5 text-xs text-red-400">{errors.deadline.message}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-white/70">
            Descrição do projeto <span className="text-brand">*</span>
          </label>
          <textarea
            {...register('projectDescription')}
            rows={4}
            placeholder="Descreva o seu projeto em detalhes. Quanto mais informações, melhor será o entendimento do escopo."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
          />
          {errors.projectDescription ? (
            <p className="mt-1.5 text-xs text-red-400">{errors.projectDescription.message}</p>
          ) : null}
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
