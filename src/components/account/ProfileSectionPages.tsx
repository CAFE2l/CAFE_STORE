'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  Circle,
  Copy,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  MapPin,
  Package,
  Plus,
  Shield,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function EmptyPanel({ title, subtitle, action }: { title: string; subtitle?: string; action?: { href?: string; label: string; onClick?: () => void } }) {
  const button = action?.href ? (
    <Link href={action.href} className="btn-primary mt-5 inline-flex">
      {action.label}
    </Link>
  ) : action ? (
    <Button className="mt-5" onClick={action.onClick}>{action.label}</Button>
  ) : null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-10 text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
        <Package className="size-7" />
      </div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {subtitle ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{subtitle}</p> : null}
      {button}
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <div className="flex gap-4">
            <div className="size-20 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/3 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-white/[0.06]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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

type FavoriteProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  images: string[];
};

export function FavoritesPageClient() {
  const addItem = useCartStore((state) => state.addItem);
  const [items, setItems] = useState<FavoriteProduct[]>([]);
  const [removed, setRemoved] = useState<FavoriteProduct | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch('/api/user/favorites');
    const json = await response.json();
    setItems((json.data ?? []).map((item: { product: FavoriteProduct }) => item.product));
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(product: FavoriteProduct) {
    setItems((current) => current.filter((item) => item.id !== product.id));
    setRemoved(product);
    await fetch(`/api/user/favorites/${product.id}`, { method: 'DELETE' });
    setTimeout(() => setRemoved(null), 4000);
  }

  async function undo() {
    if (!removed) return;
    await fetch('/api/user/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: removed.id }),
    });
    setItems((current) => [removed, ...current]);
    setRemoved(null);
  }

  if (loading) return <SkeletonCards />;

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-bold text-white">Meus Favoritos</h2>
        <p className="mt-1 text-sm text-zinc-500">{items.length} produto(s) favoritado(s)</p>
      </div>
      {items.length === 0 ? (
        <EmptyPanel title="Sua lista de favoritos esta vazia" action={{ href: '/products', label: 'Explorar produtos' }} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((product) => (
            <article key={product.id} className="group rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-3 transition hover:border-brand/30">
              <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-xl bg-zinc-800">
                <Image src={product.images[0] ?? '/placeholder-product.svg'} alt={product.name} fill sizes="260px" className="object-cover transition group-hover:scale-105" />
                {product.stock <= 0 ? <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">Sem estoque</span> : null}
              </Link>
              <div className="mt-3 grid gap-2">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-white hover:text-brand">{product.name}</Link>
                  <button type="button" className="text-brand transition active:scale-125" onClick={() => void remove(product)} aria-label="Remover favorito">
                    <Heart className="size-5 fill-current" />
                  </button>
                </div>
                <p className="font-bold text-brand">{currencyFormatter.format(product.price)}</p>
                <Button
                  disabled={product.stock <= 0}
                  onClick={() => addItem({ id: product.id, productId: product.id, slug: product.slug, name: product.name, image: product.images[0] ?? '/placeholder-product.svg', price: product.price, quantity: 1, stock: product.stock })}
                >
                  Adicionar ao carrinho
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {removed ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/[0.08] bg-zinc-900 px-4 py-3 text-sm text-white shadow-2xl">
          Removido dos favoritos.
          <button type="button" className="ml-3 font-semibold text-brand" onClick={() => void undo()}>Desfazer</button>
        </div>
      ) : null}
    </div>
  );
}

type AddressItem = {
  id: string;
  label: string | null;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

const emptyAddress = { label: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: '' };

export function AddressesPageClient() {
  const numberRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<AddressItem[]>([]);
  const [form, setForm] = useState(emptyAddress);
  const [editing, setEditing] = useState<AddressItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const limitReached = items.length >= 5 && !editing;

  async function load() {
    setLoading(true);
    const response = await fetch('/api/user/addresses');
    const json = await response.json();
    setItems(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCep(value: string) {
    const zip = value.replace(/\D/g, '').slice(0, 8);
    setForm((current) => ({ ...current, zip: zip.replace(/^(\d{5})(\d)/, '$1-$2') }));
    if (zip.length !== 8) return;
    const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
    const data = await response.json();
    if (!data.erro) {
      setForm((current) => ({
        ...current,
        street: data.logradouro ?? current.street,
        neighborhood: data.bairro ?? current.neighborhood,
        city: data.localidade ?? current.city,
        state: data.uf ?? current.state,
      }));
      numberRef.current?.focus();
    }
  }

  function openForm(address?: AddressItem) {
    setEditing(address ?? null);
    setForm(address ? {
      label: address.label ?? '',
      street: address.street,
      number: address.number,
      complement: address.complement ?? '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zip: address.zip,
    } : emptyAddress);
    setModalOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const url = editing ? `/api/user/addresses/${editing.id}` : '/api/user/addresses';
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setModalOpen(false);
    await load();
  }

  async function remove() {
    if (!deleteId) return;
    await fetch(`/api/user/addresses/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    await load();
  }

  async function setDefault(id: string) {
    await fetch(`/api/user/addresses/${id}/default`, { method: 'PATCH' });
    await load();
  }

  if (loading) return <SkeletonCards />;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Enderecos</h2>
          <p className="mt-1 text-sm text-zinc-500">{items.length}/5 enderecos salvos</p>
        </div>
        <Button disabled={limitReached} title={limitReached ? 'Limite de 5 enderecos atingido' : undefined} onClick={() => openForm()}>
          <Plus className="mr-2 size-4" /> Adicionar novo endereco
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyPanel title="Nenhum endereco salvo" action={{ label: 'Adicionar primeiro endereco', onClick: () => openForm() }} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((address) => (
            <article key={address.id} className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{address.label || 'Endereco'}</h3>
                  {address.isDefault ? <span className="mt-2 inline-flex rounded-full bg-yellow-500/15 px-2 py-1 text-xs font-semibold text-yellow-500">Principal</span> : null}
                </div>
                <MapPin className="size-5 text-brand" />
              </div>
              <div className="mt-4 text-sm leading-6 text-zinc-400">
                <p>{address.street}, {address.number} {address.complement ? `- ${address.complement}` : ''}</p>
                <p>{address.neighborhood}</p>
                <p>{address.city}/{address.state} - {address.zip}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => openForm(address)}>Editar</Button>
                <Button variant="ghost" onClick={() => setDeleteId(address.id)}>Remover</Button>
                {!address.isDefault ? <Button variant="ghost" onClick={() => void setDefault(address.id)}>Tornar principal</Button> : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-zinc-950 p-6" onSubmit={submit}>
            <h3 className="text-lg font-semibold text-white">{editing ? 'Editar endereco' : 'Adicionar endereco'}</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input className="input-field" placeholder="Apelido" value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} />
              <input className="input-field" placeholder="CEP" value={form.zip} onChange={(event) => void handleCep(event.target.value)} />
              <input className="input-field sm:col-span-2" placeholder="Logradouro" value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} />
              <input ref={numberRef} className="input-field" placeholder="Numero" required value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} />
              <input className="input-field" placeholder="Complemento" value={form.complement} onChange={(event) => setForm({ ...form, complement: event.target.value })} />
              <input className="input-field" placeholder="Bairro" value={form.neighborhood} onChange={(event) => setForm({ ...form, neighborhood: event.target.value })} />
              <input className="input-field" placeholder="Cidade" readOnly value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
              <input className="input-field" placeholder="Estado" readOnly value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </div>
      ) : null}

      {deleteId ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-zinc-950 p-6">
            <h3 className="text-lg font-semibold text-white">Tem certeza?</h3>
            <p className="mt-2 text-sm text-zinc-400">Esse endereco sera removido.</p>
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" className="flex-1" onClick={() => void remove()}>Remover</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type CouponItem = {
  code: string;
  discount_type: 'percent' | 'fixed';
  value: number;
  expires_at: string | null;
  is_used: boolean;
  min_order_value: number | null;
  active: boolean;
};

export function CouponsPageClient() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [showOld, setShowOld] = useState(true);

  async function load() {
    const response = await fetch('/api/user/coupons');
    const json = await response.json();
    setCoupons(json.data ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function verify() {
    setError('');
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const json = await response.json();
    if (!json.success) {
      setError(json.error ?? 'Cupom invalido.');
      return;
    }
    await load();
    setCode('');
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(''), 2000);
  }

  const available = coupons.filter((coupon) => coupon.active && !coupon.is_used && (!coupon.expires_at || new Date(coupon.expires_at) >= new Date()));
  const old = coupons.filter((coupon) => !available.includes(coupon));

  function CouponCard({ coupon }: { coupon: CouponItem }) {
    const expired = Boolean(coupon.expires_at && new Date(coupon.expires_at) < new Date());
    const disabled = coupon.is_used || expired || !coupon.active;
    const status = coupon.is_used ? 'Usado' : expired || !coupon.active ? 'Expirado' : 'Disponivel';
    return (
      <article className={cn('rounded-2xl border bg-zinc-900/40 p-5', disabled ? 'border-white/[0.06] border-l-zinc-600' : 'border-white/[0.06] border-l-brand')}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-2xl font-black text-white">{coupon.code}</p>
            <p className="mt-1 text-brand">{coupon.discount_type === 'percent' ? `${coupon.value}% OFF` : `${currencyFormatter.format(coupon.value)} OFF`}</p>
          </div>
          <span className={cn('rounded-full px-2 py-1 text-xs font-semibold', status === 'Disponivel' ? 'bg-green-500/15 text-green-400' : status === 'Usado' ? 'bg-zinc-500/15 text-zinc-400' : 'bg-red-500/15 text-red-400')}>{status}</span>
        </div>
        <div className="mt-4 text-sm leading-6 text-zinc-500">
          {coupon.min_order_value ? <p>Pedido minimo: {currencyFormatter.format(coupon.min_order_value)}</p> : null}
          <p>{coupon.expires_at ? `Valido ate ${new Date(coupon.expires_at).toLocaleDateString('pt-BR')}` : 'Sem validade definida'}</p>
        </div>
        <Button className="mt-4" variant="secondary" onClick={() => void copy(coupon.code)}>
          {copied === coupon.code ? 'Copiado' : <><Copy className="mr-2 size-4" /> Copiar codigo</>}
        </Button>
      </article>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Cupons</h2>
        <p className="mt-1 text-sm text-zinc-500">Verifique e copie cupons disponiveis.</p>
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
        <div className="flex gap-3">
          <input className="input-field flex-1 uppercase" placeholder="Inserir codigo" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} />
          <Button onClick={() => void verify()}>Verificar</Button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </div>
      {coupons.length === 0 ? <EmptyPanel title="Nenhum cupom disponivel no momento" /> : null}
      {available.length > 0 ? (
        <section className="grid gap-3">
          <h3 className="font-semibold text-white">Disponiveis</h3>
          <div className="grid gap-4 md:grid-cols-2">{available.map((coupon) => <CouponCard key={coupon.code} coupon={coupon} />)}</div>
        </section>
      ) : null}
      {old.length > 0 ? (
        <section className="grid gap-3">
          <button type="button" className="text-left font-semibold text-white" onClick={() => setShowOld((value) => !value)}>
            Utilizados/Expirados {showOld ? '−' : '+'}
          </button>
          {showOld ? <div className="grid gap-4 md:grid-cols-2">{old.map((coupon) => <CouponCard key={coupon.code} coupon={coupon} />)}</div> : null}
        </section>
      ) : null}
    </div>
  );
}

type PasswordChecks = {
  length: boolean;
  longLength: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
};

type PasswordStrength = {
  score: number;
  label: string;
  color: string;
  checks: PasswordChecks;
};

function evaluatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    longLength: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (checks.length) score += 1;
  if (checks.longLength) score += 1;
  if (checks.uppercase) score += 1;
  if (checks.number) score += 1;
  if (checks.special) score += 1;

  const normalized = Math.min(4, Math.floor(score * 4 / 5));

  const levels = [
    { label: 'Muito fraca', color: '#EF4444' },
    { label: 'Fraca', color: '#F97316' },
    { label: 'Razoável', color: '#EAB308' },
    { label: 'Forte', color: '#22C55E' },
    { label: 'Muito forte', color: '#10B981' },
  ];

  return { score: normalized, checks, ...levels[normalized] };
}

const strengthChecksList: { key: keyof PasswordChecks; label: string }[] = [
  { key: 'length', label: 'Mínimo 8 caracteres' },
  { key: 'longLength', label: 'Pelo menos 12 caracteres (recomendado)' },
  { key: 'uppercase', label: 'Letra maiúscula' },
  { key: 'number', label: 'Número' },
  { key: 'special', label: 'Caractere especial (!@#$...)' },
];

type TwoFactorStatus = {
  enabled: boolean;
  activatedAt: string | null;
};

export function SecurityPageClient() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [strength, setStrength] = useState<PasswordStrength>(() => evaluatePasswordStrength(''));
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [twoFactor, setTwoFactor] = useState<TwoFactorStatus>({ enabled: false, activatedAt: null });
  const [tfLoading, setTfLoading] = useState(true);
  const [tfModalOpen, setTfModalOpen] = useState(false);
  const [tfStep, setTfStep] = useState<'setup' | 'verify' | 'recovery'>('setup');
  const [tfSecret, setTfSecret] = useState('');
  const [tfOtpauthUrl, setTfOtpauthUrl] = useState('');
  const [tfQrDataUrl, setTfQrDataUrl] = useState('');
  const [tfPin, setTfPin] = useState<string[]>(Array(6).fill(''));
  const [tfVerifying, setTfVerifying] = useState(false);
  const [tfError, setTfError] = useState('');
  const [tfRecoveryCodes, setTfRecoveryCodes] = useState<string[]>([]);
  const [tfDisableOpen, setTfDisableOpen] = useState(false);
  const [tfDisablePassword, setTfDisablePassword] = useState('');
  const [tfDisabling, setTfDisabling] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newPasswordRef = useRef<HTMLInputElement>(null);

  const canSubmit = currentPassword && newPassword && confirmPassword && newPassword === confirmPassword && strength.score >= 1;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/2fa/status');
        const json = await res.json();
        if (json.success) setTwoFactor(json.data);
      } catch {
        // ignore
      } finally {
        setTfLoading(false);
      }
    }
    void load();
  }, []);

  useEffect(() => {
    if (!tfOtpauthUrl) return;
    async function generate() {
      try {
        const { default: QRCode } = await import('qrcode');
        const url = await QRCode.toDataURL(tfOtpauthUrl, { width: 240, margin: 2, color: { dark: '#FF6B00', light: '#111111' } });
        setTfQrDataUrl(url);
      } catch {
        // ignore
      }
    }
    void generate();
  }, [tfOtpauthUrl]);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setSuccessState(false);

    const res = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error ?? 'Nao foi possivel alterar a senha.');
      showToast(json.error ?? 'Nao foi possivel alterar a senha.', 'error');
      return;
    }

    setSuccessState(true);
    setMessage('Senha alterada com sucesso');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStrength(evaluatePasswordStrength(''));
    showToast('Senha alterada com sucesso!', 'success');
    setTimeout(() => setSuccessState(false), 2000);
  }

  async function handleDeleteAccount() {
    const res = await fetch('/api/user/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: deletePassword }),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error ?? 'Nao foi possivel excluir a conta.');
      showToast(json.error ?? 'Nao foi possivel excluir a conta.', 'error');
      return;
    }
    await signOut({ callbackUrl: '/' });
  }

  async function handleSetup2FA() {
    setTfModalOpen(true);
    setTfStep('setup');
    setTfError('');

    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const json = await res.json();
      if (!json.success) {
        setTfError(json.error);
        return;
      }
      setTfSecret(json.data.secret);
      setTfOtpauthUrl(json.data.otpauth_url);
      setTfStep('verify');
    } catch {
      setTfError('Erro ao iniciar configuracao 2FA.');
    }
  }

  function handlePinChange(index: number, value: string) {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newPin = [...Array(6)].map((_, i) => digits[i] ?? '');
      setTfPin(newPin);
      const nextFocus = Math.min(digits.length, 5);
      pinRefs.current[nextFocus]?.focus();
      return;
    }

    if (!/^\d?$/.test(value)) return;

    const newPin = [...tfPin];
    newPin[index] = value;
    setTfPin(newPin);

    if (value && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  }

  function handlePinKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !tfPin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  }

  async function handleVerify2FA() {
    const token = tfPin.join('');
    if (token.length !== 6) {
      setTfError('Digite o codigo de 6 digitos.');
      return;
    }

    setTfVerifying(true);
    setTfError('');

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();

      if (!json.success) {
        setTfError(json.error);
        setTfPin(Array(6).fill(''));
        pinRefs.current[0]?.focus();
        return;
      }

      setTfRecoveryCodes(json.data.recoveryCodes);
      setTfStep('recovery');
      setTwoFactor({ enabled: true, activatedAt: new Date().toISOString() });
    } catch {
      setTfError('Erro ao verificar codigo.');
    } finally {
      setTfVerifying(false);
    }
  }

  async function handleDisable2FA() {
    setTfDisabling(true);
    setTfError('');

    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: tfDisablePassword }),
      });
      const json = await res.json();

      if (!json.success) {
        setTfError(json.error);
        showToast(json.error, 'error');
        return;
      }

      setTwoFactor({ enabled: false, activatedAt: null });
      setTfDisableOpen(false);
      setTfDisablePassword('');
      showToast('2FA desativado com sucesso.', 'success');
    } catch {
      setTfError('Erro ao desativar 2FA.');
    } finally {
      setTfDisabling(false);
    }
  }

  function handleCopyRecoveryCodes() {
    navigator.clipboard.writeText(tfRecoveryCodes.join('\n'));
    showToast('Codigos copiados!', 'success');
  }

  function handleDownloadRecoveryCodes() {
    const blob = new Blob([tfRecoveryCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cafe-store-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function closeModal() {
    setTfModalOpen(false);
    setTfStep('setup');
    setTfPin(Array(6).fill(''));
    setTfError('');
    setTfRecoveryCodes([]);
  }

  return (
    <div className="grid gap-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h2 className="text-2xl font-bold text-white">Segurança</h2>
        <p className="mt-1 text-sm text-zinc-500">Gerencie senha, acesso e encerramento da conta.</p>
      </motion.div>

      <motion.form
        onSubmit={handleChangePassword}
        className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-[12px] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[inset_0_0_40px_rgba(255,107,0,0.05)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h3 className="flex items-center gap-2 font-semibold text-white"><Shield className="size-4 text-brand" /> Alterar senha</h3>
        <div className="mt-5 grid gap-4">
          <div className="relative">
            <input
              className="input-field w-full pr-10 transition-all duration-200 ease-out focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,107,0,0.15)]"
              type={showCurrent ? 'text' : 'password'}
              placeholder="Senha atual"
              value={currentPassword}
              autoComplete="current-password"
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              onClick={() => setShowCurrent(!showCurrent)}
              aria-label={showCurrent ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showCurrent ? <EyeOff className="size-4 transition duration-150" /> : <Eye className="size-4 transition duration-150" />}
            </button>
          </div>

          <div>
            <div className="relative">
              <input
                ref={newPasswordRef}
                className={cn(
                  'input-field w-full pr-10 transition-all duration-200 ease-out focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,107,0,0.15)]',
                )}
                type={showNew ? 'text' : 'password'}
                placeholder="Nova senha"
                value={newPassword}
                autoComplete="new-password"
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setStrength(evaluatePasswordStrength(e.target.value));
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showNew ? <EyeOff className="size-4 transition duration-150" /> : <Eye className="size-4 transition duration-150" />}
              </button>
            </div>

            {newPassword ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((segment) => (
                    <div
                      key={segment}
                      className="h-1 flex-1 rounded-[2px] transition-all duration-[400ms] ease-out"
                      style={{
                        backgroundColor: segment <= strength.score ? strength.color : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-xs font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </p>

                <div className="mt-3 grid gap-1.5">
                  {strengthChecksList.map((check) => {
                    const passed = strength.checks[check.key];
                    return (
                      <div key={check.key} className="flex items-center gap-2 text-xs">
                        <span
                          className="inline-flex items-center justify-center"
                          style={{
                            animation: passed ? 'checkPop 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : undefined,
                          }}
                        >
                          {passed ? (
                            <Check className="size-3.5 text-green-400" />
                          ) : (
                            <Circle className="size-3.5 text-zinc-600" />
                          )}
                        </span>
                        <span className={passed ? 'text-zinc-300' : 'text-zinc-500'}>{check.label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </div>

          <div className="relative">
            <input
              className={cn(
                'input-field w-full pr-10 transition-all duration-200 ease-out',
                confirmPassword && newPassword !== confirmPassword
                  ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
                  : 'focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,107,0,0.15)]',
              )}
              style={{
                animation: confirmPassword && newPassword !== confirmPassword ? 'shake 400ms ease' : undefined,
              }}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showConfirm ? <EyeOff className="size-4 transition duration-150" /> : <Eye className="size-4 transition duration-150" />}
            </button>
          </div>

          {confirmPassword && newPassword !== confirmPassword ? (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-red-400"
              role="alert"
            >
              As senhas nao conferem.
            </motion.p>
          ) : null}

          {error ? (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-red-400"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </motion.p>
          ) : null}

          {message ? (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-green-400"
              role="status"
            >
              {message}
            </motion.p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition-all duration-200 ease-out',
              successState ? 'bg-[#22C55E]' : loading ? 'bg-[#FF6B00] opacity-80' : 'bg-[#FF6B00] hover:bg-[#E55A00] hover:-translate-y-0.5 disabled:bg-[rgba(255,107,0,0.3)] disabled:cursor-not-allowed disabled:translate-y-0',
            )}
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : successState ? (
              <Check className="size-4" />
            ) : null}
            {successState ? 'Senha alterada!' : loading ? 'Alterando...' : 'Alterar senha'}
          </button>
        </div>
      </motion.form>

      <motion.section
        className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-[12px] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[inset_0_0_40px_rgba(255,107,0,0.05)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-6 shrink-0 text-brand" />
            <div>
              <h3 className="font-semibold text-white">Autenticação em dois fatores</h3>
              <p className="mt-1 text-sm text-zinc-400">Adicione uma camada extra de segurança à sua conta</p>
            </div>
          </div>
          {!tfLoading && twoFactor.enabled ? (
            <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
              <span className="size-1.5 rounded-full bg-green-400" />
              Ativo
            </span>
          ) : null}
        </div>

        {tfLoading ? (
          <div className="mt-4 h-12 animate-pulse rounded-xl bg-white/[0.06]" />
        ) : twoFactor.enabled ? (
          <div className="mt-4 grid gap-4">
            <p className="text-sm text-zinc-500">
              Ativado em {new Date(twoFactor.activatedAt!).toLocaleDateString('pt-BR')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="danger"
                onClick={() => setTfDisableOpen(true)}
              >
                Desativar 2FA
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              {[
                'Proteção mesmo se sua senha vazar',
                'Compatível com Google Authenticator e Authy',
                'Código muda a cada 30 segundos',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-3.5 shrink-0 text-green-400" />
                  {benefit}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSetup2FA}
                className="inline-flex items-center gap-2 rounded-xl border border-brand/40 px-4 py-2.5 text-sm font-semibold text-brand transition-all duration-200 hover:bg-brand/10 hover:-translate-y-0.5"
              >
                Ativar 2FA
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-2.5 py-1 text-xs font-semibold text-green-400">
                <span className="size-1.5 rounded-full bg-green-400" />
                Recomendado
              </span>
            </div>
          </div>
        )}
      </motion.section>

      <motion.section
        className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 transition-all duration-200 ease-out hover:-translate-y-0.5"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h3 className="font-semibold text-red-300">Excluir conta</h3>
        <p className="mt-2 text-sm text-zinc-400">Esta acao e irreversivel. Todos os seus dados serao desativados.</p>
        <Button variant="danger" className="mt-4" onClick={() => setDeleteOpen(true)}>Excluir minha conta</Button>
      </motion.section>

      <AnimatePresence>
        {deleteOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-950 p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              <h3 className="text-lg font-semibold text-white">Confirmar exclusão</h3>
              <p className="mt-2 text-sm text-zinc-400">Esta ação é irreversível. Todos os seus dados serão removidos.</p>
              <input
                className="input-field mt-4 w-full"
                type="password"
                placeholder="Senha atual"
                value={deletePassword}
                autoComplete="current-password"
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
              <div className="mt-6 flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                <Button variant="danger" className="flex-1" disabled={!deletePassword} onClick={() => void handleDeleteAccount()}>
                  Confirmar exclusão
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {tfModalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="w-full max-w-[480px] rounded-2xl border border-brand/20 bg-[#111111] p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              {tfStep === 'setup' ? (
                <div className="grid gap-4 text-center">
                  <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand/10 text-brand">
                    <Loader2 className="size-8 animate-spin" />
                  </div>
                  <p className="text-sm text-zinc-400">Preparando configuração...</p>
                </div>
              ) : null}

              {tfStep === 'verify' && tfQrDataUrl ? (
                <div className="grid gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Configurar 2FA</h3>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white"
                      onClick={closeModal}
                      aria-label="Fechar"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div className="grid justify-items-center gap-3">
                    <div className="rounded-xl border-2 border-brand/30 p-3">
                      <img src={tfQrDataUrl} alt="QR Code para configurar 2FA" className="size-[180px]" />
                    </div>
                    <p className="text-center text-sm text-zinc-400">
                      Escaneie com <strong className="text-white">Google Authenticator</strong> ou <strong className="text-white">Authy</strong>
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <p className="text-xs text-zinc-500">Ou insira o código manualmente:</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <code className="font-mono text-sm tracking-[0.25em] text-zinc-300">
                        {tfSecret.match(/.{1,4}/g)?.join(' ') ?? tfSecret}
                      </code>
                      <button
                        type="button"
                        className="shrink-0 text-xs font-semibold text-brand hover:text-orange-400"
                        onClick={() => {
                          navigator.clipboard.writeText(tfSecret);
                          showToast('Código copiado!', 'success');
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <p className="text-sm font-medium text-white">Digite o código de verificação</p>
                    <div className="flex justify-center gap-2">
                      {tfPin.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { pinRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          aria-label={`Dígito ${i + 1} de 6`}
                          className={cn(
                            'size-[48px] rounded-[10px] border bg-white/[0.04] text-center text-2xl font-bold text-white outline-none transition-all duration-150',
                            tfError ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : digit
                              ? 'border-brand bg-brand/10 shadow-[0_0_0_3px_rgba(255,107,0,0.15)]'
                              : 'border-white/[0.08] focus:scale-105 focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,107,0,0.15)]',
                          )}
                          onChange={(e) => handlePinChange(i, e.target.value)}
                          onKeyDown={(e) => handlePinKeyDown(i, e)}
                          onPaste={(e) => {
                            if (i !== 0) return;
                            e.preventDefault();
                            const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                            const newPin = data.split('').concat(Array(6).fill('')).slice(0, 6);
                            setTfPin(newPin);
                            const focus = Math.min(data.length, 5);
                            pinRefs.current[focus]?.focus();
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {tfError ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-sm text-red-400"
                      aria-live="assertive"
                    >
                      {tfError}
                    </motion.p>
                  ) : null}

                  <button
                    type="button"
                    disabled={tfPin.join('').length !== 6 || tfVerifying}
                    onClick={handleVerify2FA}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#E55A00] hover:-translate-y-0.5 disabled:bg-[rgba(255,107,0,0.3)] disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {tfVerifying ? (
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : null}
                    {tfVerifying ? 'Verificando...' : 'Verificar e ativar'}
                  </button>
                </div>
              ) : null}

              {tfStep === 'recovery' ? (
                <div className="grid gap-5">
                  <div className="text-center">
                    <motion.div
                      className="mx-auto mb-3 grid size-16 place-items-center rounded-2xl bg-green-500/10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <Shield className="size-8 text-green-400" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-white">2FA ativado com sucesso!</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      Sua conta agora está protegida com autenticação em dois fatores.
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                      <p className="text-xs leading-5 text-amber-300">
                        Guarde estes códigos em local seguro. Cada código só pode ser usado uma vez.
                        Sem eles, você poderá perder acesso à sua conta se perder o dispositivo.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {tfRecoveryCodes.map((code, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-mono text-xs text-zinc-300"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCopyRecoveryCodes}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06]"
                    >
                      <Copy className="size-4" />
                      Copiar todos
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadRecoveryCodes}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06]"
                    >
                      Baixar .txt
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#E55A00]"
                  >
                    Concluir
                  </button>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 2FA Disable Confirm */}
      <AnimatePresence>
        {tfDisableOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#111111] p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              <h3 className="text-lg font-bold text-white">Desativar 2FA</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Tem certeza? Sua conta perderá a proteção extra.
              </p>
              <input
                className="input-field mt-4 w-full"
                type="password"
                placeholder="Senha atual"
                value={tfDisablePassword}
                autoComplete="current-password"
                onChange={(e) => setTfDisablePassword(e.target.value)}
              />
              {tfError ? <p className="mt-2 text-sm text-red-400">{tfError}</p> : null}
              <div className="mt-6 flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setTfDisableOpen(false)} disabled={tfDisabling}>
                  Cancelar
                </Button>
                <Button variant="danger" className="flex-1" disabled={!tfDisablePassword || tfDisabling} loading={tfDisabling} onClick={() => void handleDisable2FA()}>
                  Desativar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border border-white/[0.08] bg-zinc-950 px-4 py-3 shadow-2xl"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '120%', opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            
            style={{
              borderLeft: toast.type === 'success' ? '4px solid #22C55E' : '4px solid #EF4444',
            }}
          >
            {toast.type === 'success' ? (
              <Check className="size-4 shrink-0 text-green-400" />
            ) : (
              <X className="size-4 shrink-0 text-red-400" />
            )}
            <p className="text-sm font-medium text-white">{toast.message}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
