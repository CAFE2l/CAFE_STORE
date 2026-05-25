import Link from 'next/link';
import { Check, MessageCircle, ShoppingBag } from 'lucide-react';

export default function ObrigadoPage() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-white selection:bg-brand/30 selection:text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.15),rgba(5,5,5,0.2)_45%,transparent_70%)]" />
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 pb-20 pt-36 text-center sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/20">
          <Check className="h-10 w-10 text-emerald-400" />
        </div>

        <h1 className="text-3xl font-black text-white md:text-5xl">
          Obrigado pelo envio!
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-white/50">
          Recebi seu briefing e vou analisar com atenção.
          Em até 24 horas úteis entro em contato pelo WhatsApp para alinharmos os próximos passos.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/servicos"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-white/70 transition-all hover:border-white/20 hover:text-white"
          >
            <ShoppingBag className="h-4 w-4" />
            Ver outros serviços
          </Link>
        </div>

        <p className="mt-8 text-sm text-white/30">
          Enquanto isso, me acompanhe nas redes sociais ou volte para loja.
        </p>
      </div>
    </main>
  );
}
