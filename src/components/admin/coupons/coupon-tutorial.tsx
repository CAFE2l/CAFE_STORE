'use client';

import { useState } from 'react';
import { ChevronDown, Lightbulb, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type StepProps = {
  number: number;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function Step({ number, title, children, defaultOpen }: StepProps) {
  const [open, setOpen] = useState(defaultOpen ?? number === 1);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/30 transition-all hover:border-orange-500/15">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-[11px] font-bold text-orange-400">
          {number}
        </span>
        <span className="flex-1 text-sm font-semibold text-white">{title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-zinc-500 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.04] px-5 pb-4 pt-3 text-sm leading-relaxed text-zinc-400">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Example({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-orange-500/10 bg-orange-500/[0.03] px-4 py-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-400">{label}</p>
      <div className="text-sm text-zinc-400">{children}</div>
    </div>
  );
}

export function CouponTutorial() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/80 shadow-lg">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
          <Lightbulb className="h-4 w-4 text-orange-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Como criar um cupom eficiente</h3>
          <p className="text-xs text-zinc-500">Guia rápido para campanhas promocionais</p>
        </div>
      </div>

      <div className="grid gap-3 p-5">
        <Step number={1} title="Escolha um código curto e fácil de lembrar" defaultOpen>
          <p className="mb-3">
            Códigos simples e intuitivos têm mais chance de serem lembrados e utilizados pelos clientes.
            Evite caracteres especiais, espaços ou combinações complexas.
          </p>
          <div className="flex flex-wrap gap-2">
            {['CAFE10', 'VIP20', 'PRIMEIRACOMPRA', 'FRETEGRATIS'].map((code) => (
              <span key={code} className="rounded-lg border border-white/[0.06] bg-black/40 px-3 py-1.5 font-mono text-xs text-orange-300">
                {code}
              </span>
            ))}
          </div>
        </Step>

        <Step number={2} title="Defina o tipo de desconto">
          <ul className="grid gap-3">
            <li>
              <span className="font-semibold text-white">Porcentagem</span>
              <p className="text-xs text-zinc-500">Ideal para campanhas gerais. Ex: 10% off em todo o site.</p>
            </li>
            <li>
              <span className="font-semibold text-white">Valor fixo</span>
              <p className="text-xs text-zinc-500">Bom para pedidos acima de certo valor. Ex: R$ 20 de desconto.</p>
            </li>
            <li>
              <span className="font-semibold text-white">Frete grátis</span>
              <p className="text-xs text-zinc-500">Excelente para aumentar a conversão. Defina um valor mínimo de pedido.</p>
            </li>
          </ul>
        </Step>

        <Step number={3} title="Configure regras">
          <p className="mb-3">Regras bem definidas evitam uso indevido e garantem que a campanha atinja os objetivos:</p>
          <ul className="grid gap-2 text-xs">
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-orange-400" />
              <span><strong className="text-zinc-300">Valor mínimo:</strong> evita descontos em pedidos muito baixos.</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-orange-400" />
              <span><strong className="text-zinc-300">Limite de uso:</strong> controla quantas vezes o cupom pode ser usado.</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-orange-400" />
              <span><strong className="text-zinc-300">Validade:</strong> crie urgência com prazos definidos.</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-orange-400" />
              <span><strong className="text-zinc-300">Limite por usuário:</strong> evite que uma pessoa use o cupom várias vezes.</span>
            </li>
          </ul>
        </Step>

        <Step number={4} title="Ative e acompanhe">
          <p className="mb-3">Após criar o cupom, ative-o e monitore o desempenho pela página de cupons.</p>
          <p className="text-xs text-zinc-500">
            Você pode ver quantas vezes cada cupom foi usado, editar regras a qualquer momento ou desativá-lo se necessário.
          </p>
        </Step>

        <div className="mt-1">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Exemplos práticos</p>
          <div className="grid gap-3">
            <Example label="Primeira compra">
              <p><strong className="text-zinc-300">Código:</strong> PRIMEIRACOMPRA</p>
              <p><strong className="text-zinc-300">Tipo:</strong> Porcentagem • <strong className="text-zinc-300">Valor:</strong> 10%</p>
              <p><strong className="text-zinc-300">Validade:</strong> 7 dias • <strong className="text-zinc-300">Uso por usuário:</strong> 1</p>
            </Example>
            <Example label="Campanha VIP">
              <p><strong className="text-zinc-300">Código:</strong> VIP20</p>
              <p><strong className="text-zinc-300">Tipo:</strong> Porcentagem • <strong className="text-zinc-300">Valor:</strong> 20%</p>
              <p><strong className="text-zinc-300">Limite:</strong> 100 usos • <strong className="text-zinc-300">Validade:</strong> 30 dias</p>
            </Example>
            <Example label="Frete grátis">
              <p><strong className="text-zinc-300">Código:</strong> FRETEGRATIS</p>
              <p><strong className="text-zinc-300">Tipo:</strong> Frete grátis</p>
              <p><strong className="text-zinc-300">Pedido mínimo:</strong> R$ 150</p>
            </Example>
          </div>
        </div>
      </div>
    </div>
  );
}
