import Link from 'next/link';
import { Check, Crown, ShoppingBag, Users } from 'lucide-react';
import { communityLinks, TELEGRAM_VIP_WHATSAPP } from '@/lib/community-links';

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
          Enquanto isso, acompanhe a comunidade ou volte para loja.
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="text-center">
          <p className="mb-6 text-sm text-white/50">
            Participe da comunidade enquanto seu projeto não fica pronto.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={communityLinks.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-left transition-all duration-300 hover:border-indigo-500/40 hover:bg-indigo-500/[0.06]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 transition group-hover:shadow-[0_0_16px_rgba(99,102,241,0.2)]">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Comunidade Discord</p>
                <p className="text-xs text-white/45">Entre e conheça outros criadores</p>
              </div>
            </a>
            <a
              href={TELEGRAM_VIP_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-left transition-all duration-300 hover:border-brand/40 hover:bg-brand/[0.06]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand transition group-hover:shadow-[0_0_16px_rgba(249,115,22,0.2)]">
                <Crown className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Telegram VIP</p>
                <p className="text-xs text-white/45">Liberado após a conclusão do serviço</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
