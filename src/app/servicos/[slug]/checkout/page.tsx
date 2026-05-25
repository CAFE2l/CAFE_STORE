import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, ShoppingBag } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { isValidService, getServiceName, getServicePrice, getServiceDeadline } from '@/lib/services';
import { dateTime } from '@/lib/admin/formatters';
import { WHATSAPP } from '@/lib/servicos-data';

type Props = {
  params: { slug: string };
  searchParams: { briefingId?: string };
};

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { slug } = params;

  if (!isValidService(slug)) {
    notFound();
  }

  const serviceName = getServiceName(slug);
  const price = getServicePrice(slug);
  const deadline = getServiceDeadline(slug);

  let briefing = null;
  if (searchParams.briefingId) {
    briefing = await prisma.projectBriefing.findUnique({
      where: { id: searchParams.briefingId },
    });
  }

  return (
    <main className="relative min-h-screen bg-[#050505] text-white selection:bg-brand/30 selection:text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.15),rgba(5,5,5,0.2)_45%,transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <Link
          href={`/servicos/${slug}/briefing`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao briefing
        </Link>

        <div className="mb-10">
          <span className="mb-3 inline-flex rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand">
            Checkout
          </span>
          <h1 className="text-3xl font-black text-white md:text-4xl">
            Finalizar contratação
          </h1>
          <p className="mt-2 max-w-2xl text-white/45">
            Revise as informações e finalize a solicitação do serviço.
          </p>
        </div>

        <div className="grid gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
                <ShoppingBag className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{serviceName}</h2>
                <p className="text-sm text-white/40">Prazo: {deadline}</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <span className="text-xs uppercase tracking-wider text-white/40">Investimento</span>
              <p className="mt-1 text-3xl font-black text-brand">{price}</p>
              <p className="mt-1 text-xs text-white/30">Pagamento via Mercado Pago / Pix</p>
            </div>
          </div>

          {briefing ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Resumo do briefing</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-white/40">Cliente</span>
                  <span className="font-medium text-white">{briefing.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-white/40">E-mail</span>
                  <span className="font-medium text-white">{briefing.email}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-white/40">Orçamento</span>
                  <span className="font-medium text-white">{briefing.budget || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-white/40">Prazo</span>
                  <span className="font-medium text-white">{briefing.deadline || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Data</span>
                  <span className="font-medium text-white">{dateTime.format(briefing.createdAt)}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-brand/40 bg-brand/10 px-6 text-sm font-semibold text-brand transition-all duration-300 hover:bg-brand hover:text-white hover:shadow-led-brand"
            >
              <MessageCircle className="h-5 w-5" />
              Falar no WhatsApp
            </a>
            <button
              type="button"
              disabled
              className="inline-flex h-12 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/[0.04] px-6 text-sm font-semibold text-white/30 border border-white/10"
              title="Pagamento online em breve"
            >
              Finalizar solicitação
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">Em breve</span>
            </button>
          </div>

          <p className="text-center text-xs text-white/30">
            Pagamento online será integrado em breve. Por enquanto, o briefing é enviado via WhatsApp.
          </p>
        </div>
      </div>
    </main>
  );
}
