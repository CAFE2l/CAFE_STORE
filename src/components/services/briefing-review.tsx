'use client';

import type { BriefingInput } from '@/lib/validations/project-briefing';

type Props = {
  data: BriefingInput;
  serviceName: string;
};

function YesNo(value: boolean | undefined | null) {
  if (value === true) return <span className="text-emerald-400">Sim</span>;
  if (value === false) return <span className="text-red-400">Não</span>;
  return <span className="text-white/40">—</span>;
}

export function BriefingReview({ data, serviceName }: Props) {
  const features = data.desiredFeatures || [];

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-bold text-white">Revise seu briefing</h2>
        <p className="mt-1 text-sm text-white/40">Confira todos os dados antes de enviar</p>
      </div>

      <Section title="Dados pessoais">
        <Row label="Nome" value={data.name} />
        <Row label="E-mail" value={data.email} />
        <Row label="WhatsApp" value={data.whatsapp} />
      </Section>

      <Section title="Dados do projeto">
        <Row label="Empresa/Marca" value={data.companyName} />
        <Row label="Serviço" value={serviceName} />
        <Row label="Orçamento" value={data.budget} />
        <Row label="Prazo" value={data.deadline} />
      </Section>

      <Section title="Descrição">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">{data.projectDescription}</p>
        {data.mainGoal ? (
          <>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/40">Objetivo principal</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white/70">{data.mainGoal}</p>
          </>
        ) : null}
        {data.targetAudience ? (
          <>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/40">Público-alvo</p>
            <p className="mt-1 text-sm text-white/70">{data.targetAudience}</p>
          </>
        ) : null}
        {data.references ? (
          <>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/40">Referências</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-white/70">{data.references}</p>
          </>
        ) : null}
      </Section>

      {features.length > 0 ? (
        <Section title="Funcionalidades desejadas">
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <span key={feature} className="rounded-lg border border-brand/30 bg-brand/[0.08] px-3 py-1.5 text-xs font-medium text-brand">
                {feature}
              </span>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Infraestrutura">
        <Row label="Domínio" value={YesNo(data.hasDomain)} />
        <Row label="Hospedagem" value={YesNo(data.hasHosting)} />
        <Row label="Identidade visual" value={YesNo(data.hasBranding)} />
        <Row label="Contato por" value={data.preferredContact === 'whatsapp' ? 'WhatsApp' : data.preferredContact === 'email' ? 'E-mail' : undefined} />
      </Section>

      {data.landingPageGoal || data.landingPageProduct ? (
        <Section title="Landing Page">
          {data.landingPageGoal ? <Row label="Objetivo" value={data.landingPageGoal} /> : null}
          {data.landingPageProduct ? <Row label="Produto" value={data.landingPageProduct} /> : null}
          <Row label="Formulário" value={YesNo(data.landingPageNeedsForm)} />
          <Row label="WhatsApp" value={YesNo(data.landingPageNeedsWhatsapp)} />
          <Row label="Captura de leads" value={YesNo(data.landingPageNeedsLeadCapture)} />
          <Row label="E-mail marketing" value={YesNo(data.landingPageNeedsEmailMarketing)} />
        </Section>
      ) : null}

      {data.sitePagesCount ? (
        <Section title="Site Profissional">
          <Row label="Qtd. páginas" value={String(data.sitePagesCount)} />
          <Row label="Painel admin" value={YesNo(data.siteNeedsAdmin)} />
          <Row label="Blog" value={YesNo(data.siteNeedsBlog)} />
          <Row label="SEO básico" value={YesNo(data.siteNeedsSeo)} />
        </Section>
      ) : null}

      {data.appNeedsLogin !== undefined ? (
        <Section title="Aplicação Web & SaaS">
          <Row label="Login" value={YesNo(data.appNeedsLogin)} />
          <Row label="Painel admin" value={YesNo(data.appNeedsAdmin)} />
          <Row label="Banco de dados" value={YesNo(data.appNeedsDatabase)} />
          <Row label="API" value={YesNo(data.appNeedsApi)} />
          <Row label="Pagamentos" value={YesNo(data.appNeedsPayments)} />
          {data.appUserTypesCount ? <Row label="Tipos de usuário" value={String(data.appUserTypesCount)} /> : null}
          {data.appMainFeatures ? <Row label="Funcionalidades" value={data.appMainFeatures} /> : null}
        </Section>
      ) : null}

      {data.extraNotes ? (
        <Section title="Observações">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">{data.extraNotes}</p>
        </Section>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand">{title}</h3>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.04] pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-white/40">{label}</span>
      <span className="text-sm font-medium text-white text-right">{value}</span>
    </div>
  );
}
