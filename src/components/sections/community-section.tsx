import { communityLinks, TELEGRAM_VIP_WHATSAPP } from '@/lib/community-links';
import { SocialIcon } from '@/components/ui/SocialIcon';

type CommunitySectionProps = {
  showTitle?: boolean;
  variant?: 'default' | 'compact' | 'simple';
};

export function CommunitySection({ showTitle = true, variant = 'default' }: CommunitySectionProps) {
  if (variant === 'simple') {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <a
          href={communityLinks.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-left transition-all duration-300 hover:border-indigo-500/40 hover:bg-indigo-500/[0.06]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 transition group-hover:shadow-[0_0_16px_rgba(99,102,241,0.2)]">
            <SocialIcon platform="discord" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Comunidade Discord</p>
            <p className="text-xs text-white/45">Participe das conversas</p>
          </div>
        </a>
        <a
          href={TELEGRAM_VIP_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-left transition-all duration-300 hover:border-brand/40 hover:bg-brand/[0.06]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 transition group-hover:shadow-[0_0_16px_rgba(249,115,22,0.2)]">
            <SocialIcon platform="telegram" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Telegram VIP</p>
            <p className="text-xs text-white/45">Solicitar acesso exclusivo</p>
          </div>
        </a>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {showTitle ? (
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.32em] text-brand">
            Comunidade
          </span>
          <h2 className="text-3xl font-black text-white md:text-4xl">
            Suporte e comunidade além da entrega
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/45">
            A CAFÉ STORE não entrega só arquivos. Você também pode fazer parte de uma comunidade
            para evoluir seus projetos e, ao se tornar cliente, receber acesso a um espaço VIP exclusivo.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Discord Card */}
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.045] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_0_34px_rgba(99,102,241,0.12)]">
          <div aria-hidden className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 bg-indigo-500/10 blur-3xl" />
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/20 transition group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <SocialIcon platform="discord" size={28} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">Comunidade Discord</h3>
          <p className="mb-6 flex-1 text-sm leading-relaxed text-white/60">
            Um espaço aberto para trocar ideias, tirar dúvidas, acompanhar bastidores e se conectar
            com pessoas que também estão criando projetos digitais.
          </p>
          <a
            href={communityLinks.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/40 px-5 py-3 text-sm font-semibold text-indigo-400 transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] md:w-auto"
          >
            <SocialIcon platform="discord" size={16} />
            Entrar no Discord
          </a>
          {variant === 'default' ? (
            <p className="mt-3 text-center text-xs text-white/30 md:text-left">
              Aberto para todos os interessados
            </p>
          ) : null}
        </div>

        {/* Telegram VIP Card */}
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand/20 bg-brand/[0.06] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_34px_rgba(249,115,22,0.15)]">
          <div aria-hidden className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 bg-brand/15 blur-3xl" />
          <span className="absolute right-4 top-4 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300">
            Exclusivo para clientes
          </span>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/20 transition group-hover:shadow-led-brand">
            <SocialIcon platform="telegram" size={28} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">Telegram VIP</h3>
          <p className="mb-6 flex-1 text-sm leading-relaxed text-white/60">
            Área exclusiva para clientes que já tiveram seus serviços concluídos. Receba suporte,
            novidades, conteúdos exclusivos e acompanhamento pós-entrega.
          </p>
          <a
            href={TELEGRAM_VIP_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-led-brand transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_30px_8px_rgba(249,115,22,0.35)] md:w-auto"
          >
            <SocialIcon platform="telegram" size={16} />
            Solicitar acesso VIP
          </a>
          <p className="mt-3 text-center text-xs text-white/30 md:text-left">
            Acesso liberado após a conclusão do projeto
          </p>
        </div>
      </div>
    </section>
  );
}
