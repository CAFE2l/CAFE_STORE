'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { BriefingInput } from '@/lib/validations/project-briefing';
import { PhoneField } from '@/components/ui/PhoneField';
import { FieldErrorMessage } from '@/components/services/field-error-message';

type Props = {
  form: UseFormReturn<BriefingInput>;
};

export function BriefingStepPersonal({ form }: Props) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-bold text-white">Dados pessoais</h2>
        <p className="mt-1 text-sm text-white/40">Como posso te chamar e entrar em contato</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-white/70">
            Nome completo <span className="text-brand">*</span>
          </label>
          <input
            {...register('name')}
            placeholder="Seu nome completo"
            className={`h-12 w-full rounded-xl border bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)] ${
              errors.name ? 'border-red-500' : 'border-white/10'
            }`}
          />
          <FieldErrorMessage message={errors.name?.message} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            E-mail <span className="text-brand">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="seu@email.com"
            className={`h-12 w-full rounded-xl border bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)] ${
              errors.email ? 'border-red-500' : 'border-white/10'
            }`}
          />
          <FieldErrorMessage message={errors.email?.message} />
        </div>

        <PhoneField
          name="whatsapp"
          label="WhatsApp"
          control={control}
          error={errors.whatsapp}
          defaultCountry="BR"
        />
      </div>
    </div>
  );
}
