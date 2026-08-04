'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ruler, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'camisa' | 'poliester' | 'moletom';

type SizeRow = {
  size: string;
  chest: string;
  length: string;
  sleeve: string;
};

const tables: Record<Category, { label: string; rows: SizeRow[] }> = {
  camisa: {
    label: 'Camisa Normal',
    rows: [
      { size: 'P',  chest: '48 cm', length: '68 cm', sleeve: '20 cm' },
      { size: 'M',  chest: '51 cm', length: '70 cm', sleeve: '21 cm' },
      { size: 'G',  chest: '54 cm', length: '72 cm', sleeve: '22 cm' },
      { size: 'GG', chest: '57 cm', length: '74 cm', sleeve: '23 cm' },
      { size: 'XG', chest: '60 cm', length: '76 cm', sleeve: '24 cm' },
    ],
  },
  poliester: {
    label: 'Camisa Poliéster',
    rows: [
      { size: 'P',  chest: '46 cm', length: '67 cm', sleeve: '19 cm' },
      { size: 'M',  chest: '49 cm', length: '69 cm', sleeve: '20 cm' },
      { size: 'G',  chest: '52 cm', length: '71 cm', sleeve: '21 cm' },
      { size: 'GG', chest: '55 cm', length: '73 cm', sleeve: '22 cm' },
      { size: 'XG', chest: '58 cm', length: '75 cm', sleeve: '23 cm' },
    ],
  },
  moletom: {
    label: 'Moletom',
    rows: [
      { size: 'P',  chest: '52 cm', length: '65 cm', sleeve: '58 cm' },
      { size: 'M',  chest: '55 cm', length: '67 cm', sleeve: '60 cm' },
      { size: 'G',  chest: '58 cm', length: '69 cm', sleeve: '62 cm' },
      { size: 'GG', chest: '61 cm', length: '71 cm', sleeve: '64 cm' },
      { size: 'XG', chest: '64 cm', length: '73 cm', sleeve: '66 cm' },
    ],
  },
};

const categoryOrder: Category[] = ['camisa', 'poliester', 'moletom'];

// Inline SVG diagram showing where to measure on a t-shirt silhouette
function MeasureDiagram() {
  return (
    <svg
      viewBox="0 0 260 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[220px]"
      aria-label="Diagrama de como medir a peça"
    >
      {/* shirt body */}
      <path
        d="M80 30 L40 70 L60 80 L60 190 L200 190 L200 80 L220 70 L180 30 L155 50 Q130 65 105 50 Z"
        stroke="#f97316"
        strokeWidth="2"
        fill="rgba(249,115,22,0.06)"
        strokeLinejoin="round"
      />
      {/* collar */}
      <path
        d="M105 50 Q130 75 155 50"
        stroke="#f97316"
        strokeWidth="1.5"
        fill="none"
      />

      {/* ── Largura (chest) arrow ── */}
      <line x1="65" y1="115" x2="195" y2="115" stroke="#f97316" strokeWidth="1" strokeDasharray="4 3" />
      <polygon points="65,112 58,115 65,118" fill="#f97316" />
      <polygon points="195,112 202,115 195,118" fill="#f97316" />
      <rect x="96" y="106" width="68" height="18" rx="4" fill="#111" />
      <text x="130" y="119" textAnchor="middle" fill="#f97316" fontSize="10" fontFamily="monospace">Largura</text>

      {/* ── Comprimento (length) arrow ── */}
      <line x1="215" y1="55" x2="215" y2="185" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="4 3" />
      <polygon points="212,55 215,48 218,55" fill="#a1a1aa" />
      <polygon points="212,185 215,192 218,185" fill="#a1a1aa" />
      <rect x="218" y="108" width="38" height="18" rx="4" fill="#111" />
      <text x="237" y="121" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="monospace">Compr.</text>

      {/* ── Manga (sleeve) arrow ── */}
      <line x1="130" y1="58" x2="42" y2="72" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 3" />
      <polygon points="130,55 137,58 130,61" fill="#22c55e" />
      <polygon points="42,69 35,72 42,75" fill="#22c55e" />
      <rect x="62" y="52" width="52" height="18" rx="4" fill="#111" />
      <text x="88" y="65" textAnchor="middle" fill="#22c55e" fontSize="9" fontFamily="monospace">Manga</text>
    </svg>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Pre-select a tab based on the product category slug */
  defaultCategory?: Category;
};

export function SizeGuideModal({ open, onClose, defaultCategory = 'camisa' }: Props) {
  const activeTab = defaultCategory in tables ? defaultCategory : 'camisa';
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Trap focus inside modal
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Guia de tamanhos"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d0d0d] shadow-2xl outline-none"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0d0d0d] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand">
                  <Ruler className="size-4" />
                </span>
                <h2 className="font-semibold text-white">Guia de Tamanhos</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar guia de tamanhos"
                className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-6 grid gap-6">
              {/* How to measure */}
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  <MeasureDiagram />
                </div>
                <div className="grid gap-3 text-sm">
                  <p className="font-semibold text-white">Como medir corretamente</p>
                  <ul className="grid gap-2 text-zinc-400">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 size-2 shrink-0 rounded-full bg-brand" />
                      <span><strong className="text-brand">Largura (tórax):</strong> meça horizontalmente de uma axila à outra com a peça plana.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 size-2 shrink-0 rounded-full bg-zinc-400" />
                      <span><strong className="text-zinc-300">Comprimento:</strong> do ponto mais alto do ombro até a barra inferior.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 size-2 shrink-0 rounded-full bg-green-400" />
                      <span><strong className="text-green-400">Manga:</strong> da costura do ombro até o punho (no moletom, inclui o punho).</span>
                    </li>
                  </ul>
                  <p className="text-xs text-zinc-600">Todas as medidas são da peça plana. Adicione 2–4 cm para conforto de uso.</p>
                </div>
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categoryOrder.map((cat) => (
                  <a
                    key={cat}
                    href={`#size-table-${cat}`}
                    className={cn(
                      'shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition',
                      activeTab === cat
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-white/[0.08] text-zinc-500 hover:border-brand/30 hover:text-white',
                    )}
                  >
                    {tables[cat].label}
                  </a>
                ))}
              </div>

              {/* Tables */}
              {categoryOrder.map((cat) => (
                <section key={cat} id={`size-table-${cat}`} className="grid gap-3">
                  <h3 className="text-sm font-semibold text-white">{tables[cat].label}</h3>
                  <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Tamanho</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-brand">Largura</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Comprimento</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-green-400">
                            {cat === 'moletom' ? 'Manga (c/ punho)' : 'Manga'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tables[cat].rows.map((row, i) => (
                          <tr
                            key={row.size}
                            className={cn(
                              'border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]',
                              i === tables[cat].rows.length - 1 && 'border-b-0',
                            )}
                          >
                            <td className="px-4 py-3 font-bold text-white">{row.size}</td>
                            <td className="px-4 py-3 text-center font-mono text-brand">{row.chest}</td>
                            <td className="px-4 py-3 text-center font-mono text-zinc-300">{row.length}</td>
                            <td className="px-4 py-3 text-center font-mono text-green-400">{row.sleeve}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}

              {/* Footer note */}
              <p className="text-center text-xs text-zinc-600">
                Medidas aproximadas. Pode haver variação de ±1 cm por lote de produção.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
