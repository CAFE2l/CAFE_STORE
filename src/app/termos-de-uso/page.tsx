import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de uso | Cafe Store',
  description: 'Condicoes de uso da loja, apoios simbolicos e servicos digitais Cafe Store.',
};

const sections = [
  {
    title: 'Natureza dos apoios',
    body: 'Os itens de apoio exibidos na loja sao simbolicos e ilustrativos. Eles representam contribuicoes ao projeto Cafe Store e nao garantem envio fisico, salvo campanha especifica comunicada separadamente.',
  },
  {
    title: 'Servicos digitais',
    body: 'Servicos como sites, landing pages, aplicacoes e identidade digital dependem de escopo, briefing, prazos e validacao das informacoes enviadas pelo cliente.',
  },
  {
    title: 'Conta e seguranca',
    body: 'O usuario e responsavel por manter suas credenciais seguras e por informar dados corretos. A Cafe Store pode restringir contas com uso indevido, fraude ou violacao destes termos.',
  },
  {
    title: 'Conteudo e feedbacks',
    body: 'Ao enviar feedbacks, depoimentos ou mensagens, voce declara ter direito de publica-los e pode autorizar sua exibicao publica apos moderacao.',
  },
  {
    title: 'Alteracoes',
    body: 'Estes termos podem ser atualizados para refletir mudancas operacionais, legais ou de produto. A versao publicada nesta pagina e a referencia vigente.',
  },
];

export default function TermsPage() {
  return (
    <main className="bg-surface-base px-4 py-16 sm:px-6">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand transition hover:text-brand-light">
          Voltar para a loja
        </Link>
        <h1 className="mt-6 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">Termos de uso</h1>
        <p className="mt-4 text-base leading-8 text-white/55">
          Ao acessar a Cafe Store, criar conta, solicitar servicos ou realizar apoios simbolicos, voce concorda com estes termos.
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
