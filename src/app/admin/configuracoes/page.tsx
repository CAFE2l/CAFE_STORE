import { Database, KeyRound, ShieldCheck, Webhook } from 'lucide-react';

export default function ConfiguracoesPage() {
  const cards = [
    { title: 'PostgreSQL', description: 'DATABASE_URL e DIRECT_URL configuram Prisma e migrations.', icon: Database },
    { title: 'Autenticação', description: 'NextAuth com Prisma Adapter e roles ADMIN/CUSTOMER.', icon: ShieldCheck },
    { title: 'Mercado Pago', description: 'Webhooks e pagamentos ficam ligados ao model Payment.', icon: Webhook },
    { title: 'Segurança', description: 'Separe secrets por ambiente e proteja rotas administrativas.', icon: KeyRound },
  ];

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white">Configurações</h1>
        <p className="mt-2 text-sm text-zinc-500">Arquitetura, integrações e preparação para produção.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-card backdrop-blur">
              <Icon className="h-5 w-5 text-orange-300" />
              <h2 className="mt-4 font-bold text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{card.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

