'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHATSAPP, deliverables, faqs, services } from '@/lib/servicos-data';

export default function ServicesPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.q ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '/', label: '← Loja' },
    { href: '#servicos', label: 'Serviços' },
    { href: '#pacote', label: 'Pacote Completo' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contato', label: 'Contato' },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-brand/30 selection:text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.18),rgba(5,5,5,0.2)_45%,transparent_70%)]" />
        <div className="absolute inset-x-0 top-[96px] h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#050505]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand/25 to-brand/5 ring-1 ring-brand/25 shadow-led-brand transition-all duration-500 group-hover:scale-105 group-hover:ring-brand/50">
              <Image
                src="/favicon.png"
                alt="CAFÉ STORE"
                width={40}
                height={40}
                className="size-10 rounded-full object-cover drop-shadow-[0_0_8px_rgba(249,115,22,0.45)]"
                priority
              />
            </div>
            <div>
              <span className="block bg-gradient-to-r from-brand via-[#FFD000] to-[#FF3C38] bg-clip-text text-lg font-black leading-none text-transparent">
                CAFÉ STORE
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35">Serviços digitais</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-medium text-white/45 transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-xl border border-brand/40 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand shadow-[0_0_18px_rgba(249,115,22,0.12)] transition-all duration-300 hover:bg-brand hover:text-white hover:shadow-led-brand md:inline-flex"
          >
            Falar comigo
          </a>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 md:hidden"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/[0.08] bg-[#080808] px-4 py-4 md:hidden">
            <div className="mx-auto grid max-w-7xl gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/[0.04] hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 rounded-xl bg-brand px-4 py-3 text-center text-sm font-bold text-white shadow-led-brand"
                onClick={() => setMobileOpen(false)}
              >
                Falar comigo
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-36 text-center sm:px-6 md:pt-44 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <span className="mb-4 inline-flex rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium uppercase tracking-widest text-brand shadow-[0_0_24px_rgba(249,115,22,0.16)]">
            O que eu faço
          </span>
          <h1 className="mb-4 text-5xl font-black leading-tight text-white md:text-7xl">
            Do conceito ao deploy,
            <br />
            <span className="bg-gradient-to-r from-brand via-[#FFD000] to-[#FF3C38] bg-clip-text text-transparent">
              sem enrolação
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/55 md:text-xl">
            Escolha o serviço que você precisa ou contrate o pacote completo
            e receba tudo de uma vez com desconto.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#servicos"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-brand px-7 text-sm font-bold text-white shadow-led-brand transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_30px_8px_rgba(249,115,22,0.35)]"
            >
              Ver serviços →
            </a>
            <a
              href="#pacote"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] px-7 text-sm font-semibold text-white/75 backdrop-blur transition hover:border-brand/35 hover:text-white"
            >
              Pacote completo
            </a>
          </div>
        </div>
      </section>

      <section id="servicos" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            const featured = Boolean(service.badge);

            return (
              <article
                key={service.title}
                className={cn(
                  'group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1',
                  featured
                    ? 'border-brand/40 bg-brand/[0.08] shadow-led-brand lg:-mt-4'
                    : 'border-white/[0.08] bg-white/[0.045] hover:border-brand/30 hover:shadow-[0_0_34px_rgba(249,115,22,0.12)]',
                )}
              >
                <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div aria-hidden className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 bg-brand/10 blur-3xl" />
                <span className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-white/25">
                  Plano {String(index + 1).padStart(2, '0')}
                </span>
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/20 transition group-hover:shadow-led-brand">
                      <Icon className="h-5 w-5 text-brand" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{service.title}</h2>
                  </div>
                  {service.badge ? (
                    <span className="rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand">
                      {service.badge}
                    </span>
                  ) : null}
                </div>

                <p className="mb-4 text-sm italic text-white/40">&ldquo;{service.tagline}&rdquo;</p>

                <div className="mb-5 border-b border-white/[0.06] pb-5">
                  {service.pricePrefix ? (
                    <span className="text-xs uppercase tracking-wider text-white/40">{service.pricePrefix}</span>
                  ) : null}
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-brand">{service.price}</span>
                  </div>
                  <span className="text-xs text-white/30">{service.deadline}</span>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-white/60">{service.description}</p>

                <ul className="mb-6 flex-1 space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm leading-relaxed text-white/70">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={service.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'w-full rounded-xl py-3 text-center font-medium transition-all duration-300',
                    featured
                      ? 'bg-brand text-white shadow-led-brand hover:bg-brand-light'
                      : 'border border-brand/40 text-brand hover:bg-brand hover:text-white hover:shadow-led-brand',
                  )}
                >
                  {service.cta} →
                </a>
              </article>
            );
          })}
        </div>

        <section id="pacote" className="mt-10 scroll-mt-28">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-xs uppercase tracking-widest text-white/30">Ou leve tudo de uma vez</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand/60 via-brand/30 to-brand/60 p-[1px] shadow-led-brand animate-pulse-led">
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] opacity-30" />
            <div className="relative rounded-2xl bg-[#111] p-8 md:p-10">
              <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
                    ⚡ PACOTE COMPLETO — MELHOR CUSTO-BENEFÍCIO
                  </span>
                  <h2 className="text-3xl font-black text-white md:text-5xl">Identidade Digital Completa</h2>
                  <p className="mt-2 max-w-lg text-white/50">
                    Tudo que uma marca precisa para existir, se apresentar e vender no digital,
                    entregue em um único projeto, com um único briefing.
                  </p>
                </div>
                <div className="flex-shrink-0 text-left md:text-right">
                  <span className="mb-1 block text-sm text-white/40">Investimento único</span>
                  <span className="text-5xl font-black text-brand drop-shadow-[0_0_18px_rgba(249,115,22,0.35)]">R$ 10.000</span>
                  <span className="mt-1 block text-xs text-white/30">Parcelamento sob consulta</span>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {deliverables.map((deliverable) => (
                  <div key={deliverable.title} className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-4 transition-all duration-300 hover:border-brand/25 hover:bg-brand/[0.07]">
                    <span className="mb-2 block text-2xl">{deliverable.emoji}</span>
                    <p className="text-sm font-medium text-white">{deliverable.title}</p>
                    <p className="mt-1 text-xs text-white/40">{deliverable.detail}</p>
                  </div>
                ))}
              </div>

              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl bg-brand px-10 py-4 text-lg font-bold text-white shadow-led-brand transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_30px_8px_rgba(249,115,22,0.5)] active:scale-[0.98] md:w-auto"
              >
                Quero o pacote completo →
              </a>
            </div>
          </div>
        </section>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-28 px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Perguntas rápidas</h2>
        <div>
          {faqs.map((faq) => {
            const isOpen = openFaq === faq.q;

            return (
              <div
                key={faq.q}
                className={cn('group cursor-pointer border-b border-white/[0.06] py-5', isOpen && 'open')}
                onClick={() => setOpenFaq(isOpen ? null : faq.q)}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-white">{faq.q}</span>
                  <ChevronDown className={cn('h-5 w-5 flex-shrink-0 text-brand transition-transform duration-300', isOpen && 'rotate-180')} />
                </div>
                <p
                  className={cn(
                    'overflow-hidden text-sm leading-relaxed text-white/50 transition-all duration-300',
                    isOpen ? 'mt-3 max-h-40 opacity-100' : 'mt-0 max-h-0 opacity-0',
                  )}
                >
                  {faq.a}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="contato"
        className="border-t border-white/[0.06] bg-gradient-radial from-brand/10 via-transparent to-transparent px-4 py-16 text-center"
      >
        <h2 className="mb-3 text-2xl font-bold text-white">Ficou com dúvida?</h2>
        <p className="mb-6 text-white/50">Fala comigo no WhatsApp e a gente alinha tudo em 15 minutos.</p>
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-xl bg-brand px-8 py-3 font-semibold text-white shadow-led-brand transition-all duration-300 hover:bg-brand-light"
        >
          💬 Falar no WhatsApp
        </a>
      </section>
    </main>
  );
}
