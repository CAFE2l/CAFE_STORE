import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politica de privacidade | Cafe Store',
  description: 'Como a Cafe Store trata dados de conta, pedidos, feedbacks e contato.',
};

const sections = [
  {
    title: 'Dados coletados',
    body: 'Coletamos dados informados por voce em cadastros, pedidos, formularios de contato, briefing e feedbacks. Isso pode incluir nome, e-mail, telefone, endereco, preferencias de compra e mensagens enviadas.',
  },
  {
    title: 'Uso dos dados',
    body: 'Usamos essas informacoes para operar a loja, processar apoios simbolicos, responder contatos, organizar pedidos, personalizar atendimento e melhorar a experiencia dos servicos digitais.',
  },
  {
    title: 'Cookies e sessao',
    body: 'Cookies tecnicos mantem login, carrinho, seguranca e preferencias basicas. Integracoes como autenticacao por Google podem usar cookies proprios do provedor.',
  },
  {
    title: 'Compartilhamento',
    body: 'Nao vendemos dados pessoais. Podemos compartilhar dados apenas com provedores necessarios para hospedagem, banco de dados, autenticacao, pagamentos, e-mail, analytics ou atendimento.',
  },
  {
    title: 'Direitos do usuario',
    body: 'Voce pode solicitar acesso, correcao ou remocao dos seus dados quando aplicavel. Algumas informacoes podem ser mantidas pelo tempo necessario para cumprimento legal, seguranca ou auditoria.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-surface-base px-4 py-16 sm:px-6">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand transition hover:text-brand-light">
          Voltar para a loja
        </Link>
        <h1 className="mt-6 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">Politica de privacidade</h1>
        <p className="mt-4 text-base leading-8 text-white/55">
          Esta pagina resume as praticas de privacidade da Cafe Store em linguagem direta. Ela deve ser lida junto com os termos de uso.
        </p>
        <div className="mt-10 grid gap-6">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 sm:p-6">
              <h2 className="font-display text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-3 text-base leading-8 text-white/60">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
