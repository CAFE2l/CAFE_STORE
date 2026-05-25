import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { isValidService, getServiceName, getServicePrice, getServiceDeadline } from '@/lib/services';
import { services } from '@/lib/servicos-data';
import { cn } from '@/lib/utils';

type Props = {
  params: { slug: string };
};

export default function ServiceDetailPage({ params }: Props) {
  const { slug } = params;

  if (!isValidService(slug)) {
    notFound();
  }

  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const Icon = service.icon;
  const featured = Boolean(service.badge);

  return (
    <main className="relative min-h-screen bg-[#050505] text-white selection:bg-brand/30 selection:text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.15),rgba(5,5,5,0.2)_45%,transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <Link
          href="/servicos"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para serviços
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className={cn(
              'relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl',
              featured
                ? 'border-brand/40 bg-brand/[0.08] shadow-led-brand'
                : 'border-white/[0.08] bg-white/[0.045]',
            )}>
              {service.badge ? (
                <span className="absolute right-4 top-4 rounded-full border border-brand/30 bg-brand/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-brand shadow-[0_0_16px_rgba(249,115,22,0.18)]">
                  {service.badge}
                </span>
              ) : null}

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/20">
                  <Icon className="h-6 w-6 text-brand" />
                </div>
                <h1 className="text-2xl font-bold text-white">{service.title}</h1>
              </div>

              {service.pricePrefix ? (
                <span className="text-xs uppercase tracking-wider text-white/40">{service.pricePrefix}</span>
              ) : null}
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-black text-brand">{service.price}</span>
              </div>
              <p className="mt-1 text-sm text-white/30">{service.deadline}</p>

              <p className="mt-4 text-sm leading-relaxed text-white/60">{service.description}</p>

              <ul className="mt-6 space-y-3">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm leading-relaxed text-white/70">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={`/servicos/${slug}/briefing`}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-led-brand transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_30px_8px_rgba(249,115,22,0.35)] active:scale-[0.98]"
              >
                {service.cta} →
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white">Como funciona</h2>
              <div className="mt-4 grid gap-4">
                {[
                  { num: 1, title: 'Briefing', desc: 'Preencha o formulário com os detalhes do seu projeto.' },
                  { num: 2, title: 'Proposta', desc: 'Receba uma proposta personalizada com preço e prazo.' },
                  { num: 3, title: 'Produção', desc: 'Desenvolvimento com atualizações durante o processo.' },
                  { num: 4, title: 'Entrega', desc: 'Deploy, arquivos finais e documentação do projeto.' },
                ].map((step) => (
                  <div key={step.num} className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-brand/35 bg-brand/15 text-xs font-black text-brand">
                      {step.num}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{step.title}</p>
                      <p className="text-xs text-white/45">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-transparent p-6 backdrop-blur-xl">
              <p className="text-sm font-medium text-white/70">Pronto para começar?</p>
              <p className="mt-1 text-sm text-white/45">Preencha o briefing e receba uma proposta personalizada.</p>
              <Link
                href={`/servicos/${slug}/briefing`}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-bold text-white shadow-led-brand transition-all duration-300 hover:bg-brand-light active:scale-[0.98]"
              >
                Quero este serviço →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
