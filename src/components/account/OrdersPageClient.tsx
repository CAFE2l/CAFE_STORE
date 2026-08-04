'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Eye, Loader2, Package, ShoppingBag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { SkeletonCards, currencyFormatter } from './shared';

type OrderStatus = 'aguardando_pagamento' | 'agendado' | 'em_processamento' | 'enviado' | 'entregue' | 'cancelado';
type OrderItem = {
  id: string;
  productId: string;
  slug: string;
  nome: string;
  thumbnail: string;
  quantidade: number;
  preco: number;
  variants?: unknown;
};
type UserOrder = {
  id: string;
  numero: string;
  created_at: string;
  status: OrderStatus;
  total: number;
  metodo_pagamento: string;
  endereco_entrega: Record<string, string>;
  items: OrderItem[];
};

const statusMeta: Record<OrderStatus, { label: string; badge: string; dot: string }> = {
  aguardando_pagamento: {
    label: 'Pendente',
    badge: 'border-yellow-400/30 bg-yellow-400/15 text-yellow-400',
    dot: 'bg-yellow-400',
  },
  agendado: {
    label: 'Pendente',
    badge: 'border-yellow-400/30 bg-yellow-400/15 text-yellow-400',
    dot: 'bg-yellow-400',
  },
  em_processamento: {
    label: 'Processando',
    badge: 'border-brand/30 bg-brand/15 text-brand',
    dot: 'bg-brand',
  },
  enviado: {
    label: 'Processando',
    badge: 'border-brand/30 bg-brand/15 text-brand',
    dot: 'bg-brand',
  },
  entregue: {
    label: 'Entregue',
    badge: 'border-green-500/30 bg-green-500/15 text-green-500',
    dot: 'bg-green-500',
  },
  cancelado: {
    label: 'Cancelado',
    badge: 'border-red-500/30 bg-red-500/15 text-red-500',
    dot: 'bg-red-500',
  },
};

const orderFilters: { value: 'todos' | OrderStatus; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'aguardando_pagamento', label: 'Pendente' },
  { value: 'em_processamento', label: 'Processando' },
  { value: 'cancelado', label: 'Cancelado' },
];

function formatOrderDate(value: string, includeTime = false) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value));
}

function formatVariants(variants: unknown) {
  if (!variants) return '';
  if (Array.isArray(variants)) {
    return variants
      .map((variant) => {
        if (!variant || typeof variant !== 'object') return '';
        const record = variant as Record<string, unknown>;
        const name = String(record.name ?? record.label ?? record.tipo ?? '').trim();
        const value = String(record.value ?? record.valor ?? record.option ?? '').trim();
        return [name, value].filter(Boolean).join(' ');
      })
      .filter(Boolean)
      .join(' / ');
  }
  if (typeof variants === 'object') {
    return Object.entries(variants as Record<string, unknown>)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(' / ');
  }
  return String(variants);
}

function StatusPill({ status, large = false }: { status: OrderStatus; large?: boolean }) {
  const meta = statusMeta[status] ?? statusMeta.em_processamento;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-semibold',
      large ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]',
      meta.badge,
    )}>
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}
export function OrdersPageClient() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [status, setStatus] = useState<'todos' | OrderStatus>('todos');
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [detailsOrder, setDetailsOrder] = useState<UserOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<UserOrder | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [cancelOrder, setCancelOrder] = useState<UserOrder | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async (nextCursor?: string | null) => {
    if (nextCursor) setLoadingMore(true);
    else setLoading(true);

    const params = new URLSearchParams({ status, q });
    if (nextCursor) params.set('cursor', nextCursor);
    const response = await fetch(`/api/user/orders?${params.toString()}`);
    const json = await response.json();
    const data = json.data as { orders: UserOrder[]; nextCursor: string | null; total: number };
    setOrders((current) => (nextCursor ? [...current, ...data.orders] : data.orders));
    setCursor(data.nextCursor);
    setTotal(data.total);
    setLoading(false);
    setLoadingMore(false);
  }, [q, status]);

  useEffect(() => {
    const id = setTimeout(() => void load(null), 250);
    return () => clearTimeout(id);
  }, [load]);

  async function confirmDelete() {
    if (!deleteOrder) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/user/orders/${deleteOrder.id}`, { method: 'DELETE' });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        setToast(json?.error ?? 'Nao foi possivel remover o pedido.');
        return;
      }
      setOrders((current) => current.filter((order) => order.id !== deleteOrder.id));
      setTotal((current) => Math.max(0, current - 1));
      setDeleteOrder(null);
      setToast('Pedido removido do historico');
    } catch {
      setToast('Nao foi possivel remover o pedido agora.');
    } finally {
      setDeleting(false);
      setTimeout(() => setToast(''), 3200);
    }
  }

  async function confirmCancel() {
    if (!cancelOrder) return;
    setCancelling(true);
    try {
      const response = await fetch(`/api/user/orders/${cancelOrder.id}`, { method: 'PATCH' });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        setToast(json?.error ?? 'Nao foi possivel cancelar o pedido.');
        return;
      }
      setOrders((current) => {
        const updated = current.map((order) =>
          order.id === cancelOrder.id ? { ...order, status: 'cancelado' as OrderStatus } : order,
        );
        if (status === 'todos' || status === 'cancelado') return updated;
        return updated.filter((order) => order.id !== cancelOrder.id);
      });
      setCancelOrder(null);
      setToast('Pedido cancelado');
    } catch {
      setToast('Nao foi possivel cancelar o pedido agora.');
    } finally {
      setCancelling(false);
      setTimeout(() => setToast(''), 3200);
    }
  }

  if (loading) return <SkeletonCards />;

  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl border border-brand/20 bg-brand/10 text-brand">
                <ShoppingBag className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-[2rem] font-bold leading-tight text-white">Meus Pedidos</h2>
                <p className="mt-1 text-sm text-white/50">Acompanhe seus apoios, detalhes e historico de compras.</p>
              </div>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-zinc-300">
                {total} {total === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
              </span>
            </div>
          </div>
          <input
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-brand/60 sm:w-64"
            placeholder="Buscar numero do pedido"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            aria-label="Buscar numero do pedido"
          />
        </div>
        <div className="h-0.5 w-full bg-gradient-to-r from-brand via-brand/40 to-transparent" />
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {orderFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition',
              status === filter.value
                ? 'border-brand bg-brand text-white shadow-[0_8px_24px_rgba(249,115,22,0.22)]'
                : 'border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:border-brand/40 hover:text-white',
            )}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <ShoppingBag className="mx-auto size-20 text-white/20" />
          <h3 className="mt-5 text-xl font-bold text-white">Nenhum pedido ainda</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/45">Seus apoios aparecerao aqui apos a compra.</p>
          <Link href="/products" className="btn-primary mt-6 inline-flex">Explorar apoios</Link>
        </div>
      ) : (
        <motion.div className="grid gap-4" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}>
          <AnimatePresence initial={false}>
          {orders.map((order) => {
            const previewItems = order.items.slice(0, 2);
            const hiddenCount = Math.max(0, order.items.length - previewItems.length);
            const itemCount = order.items.reduce((sum, item) => sum + item.quantidade, 0);

            return (
              <motion.article
                key={order.id}
                layout
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                exit={{ opacity: 0, y: -14, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="grid gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:border-brand/30 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] lg:grid-cols-[minmax(180px,0.9fr)_minmax(260px,1.4fr)_auto] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-semibold text-white">#{order.numero}</p>
                    <StatusPill status={order.status} />
                  </div>
                  <p className="mt-2 text-sm text-white/45">{formatOrderDate(order.created_at)}</p>
                  <p className="mt-3 text-sm text-white/55">
                    <span className="font-bold text-brand">{currencyFormatter.format(order.total)}</span>
                    <span className="mx-2 text-white/20">•</span>
                    {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                  </p>
                </div>

                <div className="grid gap-2">
                  {previewItems.map((item) => {
                    const variantText = formatVariants(item.variants);
                    return (
                      <div key={item.id} className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-white/[0.03] p-2">
                        <Image src={item.thumbnail || '/placeholder-product.svg'} alt={item.nome} width={40} height={40} className="size-10 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{item.nome}</p>
                          <p className="truncate text-xs text-white/50">{variantText || 'Variacao padrao'}</p>
                        </div>
                        <span className="text-xs font-semibold text-white/55">Qtd {item.quantidade}</span>
                      </div>
                    );
                  })}
                  {hiddenCount > 0 ? <p className="px-2 text-xs text-white/40">+{hiddenCount} mais</p> : null}
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand/15"
                  >
                    <Eye className="size-4" />
                    Ver detalhes
                  </Link>

                  {order.status === 'cancelado' ? (
                    <button
                      type="button"
                      title="Apenas pedidos cancelados podem ser removidos do historico."
                      className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => setDeleteOrder(order)}
                    >
                      <Trash2 className="size-4" />
                      Deletar
                    </button>
                  ) : order.status === 'aguardando_pagamento' || order.status === 'agendado' || order.status === 'em_processamento' ? (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand/15"
                      onClick={() => setCancelOrder(order)}
                    >
                      <X className="size-4" />
                      Cancelar pedido
                    </button>
                  ) : order.status === 'entregue' ? (
                    <span
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-500/25 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-400"
                      title="Este pedido foi concluido e mantido no historico por seguranca."
                    >
                      <Check className="size-4" />
                      Historico finalizado
                    </span>
                  ) : order.status === 'enviado' ? (
                    <span
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-400"
                      title="Nao e possivel cancelar um pedido que ja foi despachado."
                    >
                      <Package className="size-4" />
                      Em transito
                    </span>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
          </AnimatePresence>
        </motion.div>
      )}

      {cursor ? (
        <Button variant="secondary" loading={loadingMore} onClick={() => void load(cursor)}>
          Carregar mais
        </Button>
      ) : null}

      <AnimatePresence>
        {detailsOrder ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-[20px] border border-brand/20 bg-[#111111] p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-mono text-xl font-bold text-white">Pedido #{detailsOrder.numero}</h3>
                  <p className="mt-1 text-sm text-white/45">{formatOrderDate(detailsOrder.created_at, true)}</p>
                  <div className="mt-3">
                    <StatusPill status={detailsOrder.status} large />
                  </div>
                </div>
                <button type="button" className="rounded-full p-2 text-white/45 transition hover:bg-white/10 hover:text-white" onClick={() => setDetailsOrder(null)} aria-label="Fechar detalhes do pedido">
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                {detailsOrder.items.map((item) => {
                  const variantText = formatVariants(item.variants);
                  const itemTotal = item.preco * item.quantidade;
                  return (
                    <div key={item.id} className="grid grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
                      <Image src={item.thumbnail || '/placeholder-product.svg'} alt={item.nome} width={60} height={60} className="size-[60px] rounded-[10px] object-cover" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{item.nome}</p>
                        <p className="mt-1 text-xs text-white/45">{variantText || 'Variacao padrao'}</p>
                        <p className="mt-1 text-xs text-white/55">{item.quantidade} x {currencyFormatter.format(item.preco)}</p>
                      </div>
                      <p className="text-sm font-bold text-white">{currencyFormatter.format(itemTotal)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="flex justify-between border-b border-white/[0.06] pb-3 text-sm text-white/55">
                  <span>Subtotal</span>
                  <span>{currencyFormatter.format(detailsOrder.total)}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] py-3 text-sm text-white/55">
                  <span>Entrega</span>
                  <span>Nao se aplica</span>
                </div>
                <div className="flex justify-between pt-4 text-lg font-bold text-white">
                  <span>Total</span>
                  <span className="text-brand">{currencyFormatter.format(detailsOrder.total)}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-white/40">Este pedido representa uma doacao simbolica de apoio ao Cafe Store.</p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteOrder ? (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true">
            <motion.div className="w-full max-w-md rounded-[20px] border border-red-500/20 bg-[#111111] p-6 shadow-2xl" initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }}>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-500/10 text-red-400">
                  <AlertTriangle className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">Remover pedido?</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">Tem certeza que deseja remover o pedido #{deleteOrder.numero} do seu historico?</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white" onClick={() => setDeleteOrder(null)} disabled={deleting}>
                  Cancelar
                </button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => void confirmDelete()} disabled={deleting}>
                  {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Sim, remover
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {cancelOrder ? (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true">
            <motion.div className="w-full max-w-md rounded-[20px] border border-brand/25 bg-[#111111] p-6 shadow-2xl" initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }}>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <X className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">Cancelar pedido?</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Deseja cancelar o pedido #{cancelOrder.numero}? Esta acao nao pode ser desfeita e o suporte sera notificado automaticamente.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white" onClick={() => setCancelOrder(null)} disabled={cancelling}>
                  Voltar
                </button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => void confirmCancel()} disabled={cancelling}>
                  {cancelling ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
                  Sim, cancelar pedido
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div className="fixed bottom-6 right-6 z-[60] rounded-xl border border-white/[0.08] bg-zinc-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
