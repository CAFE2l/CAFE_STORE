import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BriefingForm } from '@/components/services/briefing-form';
import { isValidService, getServiceName } from '@/lib/services';

type Props = {
  params: { slug: string };
};

export default function BriefingPage({ params }: Props) {
  const { slug } = params;

  if (!isValidService(slug)) {
    notFound();
  }

  const serviceName = getServiceName(slug);

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

        <div className="mb-10">
          <span className="mb-3 inline-flex rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand">
            Briefing
          </span>
          <h1 className="text-3xl font-black text-white md:text-4xl">
            {serviceName}
          </h1>
          <p className="mt-2 max-w-2xl text-white/45">
            Preencha o formulário abaixo para que eu entenda melhor o seu projeto.
            Assim consigo preparar uma proposta personalizada para você.
          </p>
        </div>

        <BriefingForm serviceSlug={slug} />
      </div>
    </main>
  );
}
