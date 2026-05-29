'use client';

import type { FieldPath, UseFormReturn } from 'react-hook-form';
import type { BriefingInput } from '@/lib/validations/project-briefing';

type Props = {
  form: UseFormReturn<BriefingInput>;
  serviceSlug: string;
};

const commonFeatures: Record<string, string[]> = {
  'landing-pages': [
    'Formulário de contato',
    'Integração com WhatsApp',
    'Captura de leads',
    'Integração com e-mail marketing',
    'Animações e microinterações',
    'SEO on-page',
  ],
  'sites-profissionais': [
    'Painel administrativo',
    'Blog integrado',
    'SEO básico',
    'Formulário de contato',
    'Galeria de portfólio',
    'Integração com Google Analytics',
  ],
  'saas-webapp': [
    'Login e cadastro',
    'Painel administrativo',
    'Banco de dados',
    'API REST',
    'Pagamento online',
    'Notificações por e-mail',
    'Dashboard com gráficos',
    'Relatórios exportáveis',
  ],
};

export function BriefingStepTechnical({ form, serviceSlug }: Props) {
  const { register, watch, setValue, formState: { errors } } = form;
  const features = watch('desiredFeatures') || [];

  function toggleFeature(feature: string) {
    if (features.includes(feature)) {
      setValue('desiredFeatures', features.filter((f) => f !== feature), { shouldValidate: true });
    } else {
      setValue('desiredFeatures', [...features, feature], { shouldValidate: true });
    }
  }

  function handleCheckbox(e: React.ChangeEvent<HTMLInputElement>, field: FieldPath<BriefingInput>) {
    const value = e.target.checked;
    setValue(field, value, { shouldValidate: true });
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-bold text-white">Detalhes técnicos</h2>
        <p className="mt-1 text-sm text-white/40">Funcionalidades e requisitos específicos</p>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-white/70">
          Funcionalidades desejadas
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {(commonFeatures[serviceSlug] || []).map((feature) => {
            const checked = features.includes(feature);
            return (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  checked
                    ? 'border-brand/50 bg-brand/[0.1] text-brand shadow-[0_0_16px_rgba(249,115,22,0.08)]'
                    : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80'
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-bold transition-all ${
                  checked ? 'border-brand bg-brand text-white' : 'border-white/20 text-transparent'
                }`}>
                  {checked ? '✓' : ''}
                </span>
                {feature}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Já possui domínio?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setValue('hasDomain', true, { shouldValidate: true })}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                watch('hasDomain') === true
                  ? 'border-brand/50 bg-brand/[0.1] text-brand'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
              }`}
            >
              Sim
            </button>
            <button
              type="button"
              onClick={() => setValue('hasDomain', false, { shouldValidate: true })}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                watch('hasDomain') === false
                  ? 'border-brand/50 bg-brand/[0.1] text-brand'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
              }`}
            >
              Não
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Já possui hospedagem?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setValue('hasHosting', true, { shouldValidate: true })}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                watch('hasHosting') === true
                  ? 'border-brand/50 bg-brand/[0.1] text-brand'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
              }`}
            >
              Sim
            </button>
            <button
              type="button"
              onClick={() => setValue('hasHosting', false, { shouldValidate: true })}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                watch('hasHosting') === false
                  ? 'border-brand/50 bg-brand/[0.1] text-brand'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
              }`}
            >
              Não
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            Já possui identidade visual/logo?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setValue('hasBranding', true, { shouldValidate: true })}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                watch('hasBranding') === true
                  ? 'border-brand/50 bg-brand/[0.1] text-brand'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
              }`}
            >
              Sim
            </button>
            <button
              type="button"
              onClick={() => setValue('hasBranding', false, { shouldValidate: true })}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                watch('hasBranding') === false
                  ? 'border-brand/50 bg-brand/[0.1] text-brand'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
              }`}
            >
              Não
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">
          Prefere contato por:
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setValue('preferredContact', 'whatsapp', { shouldValidate: true })}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
              watch('preferredContact') === 'whatsapp'
                ? 'border-brand/50 bg-brand/[0.1] text-brand'
                : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
            }`}
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setValue('preferredContact', 'email', { shouldValidate: true })}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
              watch('preferredContact') === 'email'
                ? 'border-brand/50 bg-brand/[0.1] text-brand'
                : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
            }`}
          >
            E-mail
          </button>
        </div>
      </div>

      {serviceSlug === 'landing-pages' && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="mb-4 font-semibold text-white">Específico para Landing Page</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white/70">
                Objetivo da landing page
              </label>
              <input
                {...register('landingPageGoal')}
                placeholder="Ex: vender um curso, captar leads para imobiliária..."
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white/70">
                Produto ou serviço que será vendido/promovido
              </label>
              <input
                {...register('landingPageProduct')}
                placeholder="Ex: ebook, consultoria, serviço de assinatura..."
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
              />
            </div>
            <CheckboxField
              label="Precisa de formulário?"
              checked={watch('landingPageNeedsForm') || false}
              onChange={(e) => handleCheckbox(e, 'landingPageNeedsForm')}
            />
            <CheckboxField
              label="Precisa integração com WhatsApp?"
              checked={watch('landingPageNeedsWhatsapp') || false}
              onChange={(e) => handleCheckbox(e, 'landingPageNeedsWhatsapp')}
            />
            <CheckboxField
              label="Precisa captura de leads?"
              checked={watch('landingPageNeedsLeadCapture') || false}
              onChange={(e) => handleCheckbox(e, 'landingPageNeedsLeadCapture')}
            />
            <CheckboxField
              label="Precisa integração com e-mail marketing?"
              checked={watch('landingPageNeedsEmailMarketing') || false}
              onChange={(e) => handleCheckbox(e, 'landingPageNeedsEmailMarketing')}
            />
          </div>
        </div>
      )}

      {serviceSlug === 'sites-profissionais' && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="mb-4 font-semibold text-white">Específico para Site Profissional</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Quantidade aproximada de páginas
              </label>
              <input
                {...register('sitePagesCount', { valueAsNumber: true })}
                type="number"
                min={1}
                placeholder="Ex: 5"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
              />
            </div>
            <CheckboxField
              label="Precisa de painel administrativo?"
              checked={watch('siteNeedsAdmin') || false}
              onChange={(e) => handleCheckbox(e, 'siteNeedsAdmin')}
            />
            <CheckboxField
              label="Precisa de blog?"
              checked={watch('siteNeedsBlog') || false}
              onChange={(e) => handleCheckbox(e, 'siteNeedsBlog')}
            />
            <CheckboxField
              label="Precisa de SEO básico?"
              checked={watch('siteNeedsSeo') || false}
              onChange={(e) => handleCheckbox(e, 'siteNeedsSeo')}
            />
          </div>
        </div>
      )}

      {serviceSlug === 'saas-webapp' && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="mb-4 font-semibold text-white">Específico para Aplicações Web & SaaS</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <CheckboxField
              label="Precisa de login e cadastro?"
              checked={watch('appNeedsLogin') || false}
              onChange={(e) => handleCheckbox(e, 'appNeedsLogin')}
            />
            <CheckboxField
              label="Precisa de painel administrativo?"
              checked={watch('appNeedsAdmin') || false}
              onChange={(e) => handleCheckbox(e, 'appNeedsAdmin')}
            />
            <CheckboxField
              label="Precisa de banco de dados?"
              checked={watch('appNeedsDatabase') || false}
              onChange={(e) => handleCheckbox(e, 'appNeedsDatabase')}
            />
            <CheckboxField
              label="Precisa de API?"
              checked={watch('appNeedsApi') || false}
              onChange={(e) => handleCheckbox(e, 'appNeedsApi')}
            />
            <CheckboxField
              label="Precisa de pagamentos?"
              checked={watch('appNeedsPayments') || false}
              onChange={(e) => handleCheckbox(e, 'appNeedsPayments')}
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Quantidade de tipos de usuário
              </label>
              <input
                {...register('appUserTypesCount', { valueAsNumber: true })}
                type="number"
                min={1}
                placeholder="Ex: 2 (admin e cliente)"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white/70">
                Principais funcionalidades do sistema
              </label>
              <textarea
                {...register('appMainFeatures')}
                rows={3}
                placeholder="Descreva as principais funcionalidades que o sistema precisa ter..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">
          Observações adicionais
        </label>
        <textarea
          {...register('extraNotes')}
          rows={3}
          placeholder="Alguma informação extra que queira compartilhar?"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)]"
        />
      </div>
    </div>
  );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60 transition hover:border-white/20 hover:text-white/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 rounded-md border-white/20 bg-transparent text-brand focus:ring-brand/50"
      />
      {label}
    </label>
  );
}
