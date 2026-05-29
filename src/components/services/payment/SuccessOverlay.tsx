'use client';

import { motion } from 'framer-motion';
import { WhatsappIcon } from '@/components/ui/WhatsappIcon';

const particles = Array.from({ length: 26 }, (_, index) => index);

type Props = {
  onWhatsApp: () => void;
};

export function SuccessOverlay({ onWhatsApp }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] grid place-items-center bg-black/80 px-4 backdrop-blur-sm"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.span
            key={particle}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm bg-orange-500"
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{
              x: Math.cos(particle) * (120 + particle * 5),
              y: Math.sin(particle * 1.7) * (90 + particle * 3),
              rotate: 180 + particle * 19,
              opacity: 0,
            }}
            transition={{ duration: 1.15, ease: 'easeOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 18 }}
        className="relative w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-zinc-900 p-6 text-center shadow-2xl"
      >
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15">
          <motion.svg className="h-9 w-9 text-emerald-400" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M5 12.5l4.2 4.2L19 7"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.15, duration: 0.45 }}
            />
          </motion.svg>
        </div>
        <h2 className="text-xl font-bold text-white">Pagamento confirmado</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Sua solicitação foi registrada. Envie o briefing pelo WhatsApp para mantermos o mesmo fluxo de atendimento.
        </p>
        <button
          type="button"
          onClick={onWhatsApp}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-400"
        >
          <WhatsappIcon className="h-4 w-4 shrink-0" />
          Enviar briefing no WhatsApp
        </button>
      </motion.div>
    </motion.div>
  );
}
