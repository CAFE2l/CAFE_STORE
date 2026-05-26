'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Copy,
  Eye,
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
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand/15"
                    onClick={() => setDetailsOrder(order)}
                  >
                    <Eye className="size-4" />
                    Ver detalhes
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => setDeleteOrder(order)}
                  >
                    <Trash2 className="size-4" />
                    Deletar
                  </button>
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

function passwordScore(value: string) {
  const hasLetters = /[A-Za-z]/.test(value);
  const hasNumbers = /\d/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  const hasLength = value.length >= 8;
  if (hasLetters && hasNumbers && hasSpecial && hasLength) return { label: 'Senha forte', color: 'bg-green-500', width: '100%' };
  if (hasLetters && hasNumbers) return { label: 'Senha media', color: 'bg-yellow-500', width: '66%' };
  return { label: 'Senha fraca', color: 'bg-red-500', width: '33%' };
}

export function SecurityPageClient() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const strength = passwordScore(newPassword);
  const canSubmit = currentPassword && newPassword && confirmPassword && newPassword === confirmPassword;

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const response = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await response.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error ?? 'Nao foi possivel alterar a senha.');
      return;
    }
    setMessage('Senha alterada com sucesso');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  async function deleteAccount() {
    const response = await fetch('/api/user/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: deletePassword }),
    });
    const json = await response.json();
    if (!json.success) {
      setError(json.error ?? 'Nao foi possivel excluir a conta.');
      return;
    }
    await signOut({ callbackUrl: '/' });
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Segurança</h2>
        <p className="mt-1 text-sm text-zinc-500">Gerencie senha, acesso e encerramento da conta.</p>
      </div>
      <form className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-5" onSubmit={changePassword}>
        <h3 className="flex items-center gap-2 font-semibold text-white"><Shield className="size-4 text-brand" /> Alterar senha</h3>
        <div className="mt-5 grid gap-4">
          <input className="input-field" type="password" placeholder="Senha atual" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          <div>
            <input className="input-field" type="password" placeholder="Nova senha" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div className={cn('h-full transition-all', strength.color)} style={{ width: strength.width }} />
            </div>
            <p className="mt-1 text-xs text-zinc-500">{strength.label}</p>
          </div>
          <input className="input-field" type="password" placeholder="Confirmar nova senha" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          {confirmPassword && newPassword !== confirmPassword ? <p className="text-sm text-red-400">As senhas nao conferem.</p> : null}
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {message ? <p className="text-sm text-green-400">{message}</p> : null}
          <Button disabled={!canSubmit || loading} loading={loading}>Alterar senha</Button>
        </div>
      </form>
      <section className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-5">
        <h3 className="font-semibold text-white">Autenticacao em dois fatores</h3>
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-white/[0.03] p-4">
          <div>
            <p className="text-sm text-zinc-300">Protecao extra para sua conta</p>
            <span className="mt-2 inline-flex rounded-full bg-zinc-700 px-2 py-1 text-xs text-zinc-300">Em breve</span>
          </div>
          <input type="checkbox" disabled className="h-5 w-5" />
        </div>
      </section>
      <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <h3 className="font-semibold text-red-300">Excluir conta</h3>
        <p className="mt-2 text-sm text-zinc-400">Esta acao e irreversivel. Todos os seus dados serao desativados.</p>
        <Button variant="danger" className="mt-4" onClick={() => setDeleteOpen(true)}>Excluir minha conta</Button>
      </section>
      {deleteOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-950 p-6">
            <h3 className="text-lg font-semibold text-white">Confirmar exclusao</h3>
            <p className="mt-2 text-sm text-zinc-400">Esta acao e irreversivel. Todos os seus dados serao removidos.</p>
            <input className="input-field mt-4" type="password" placeholder="Senha atual" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} />
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
              <Button variant="danger" className="flex-1" disabled={!deletePassword} onClick={() => void deleteAccount()}>
                Confirmar exclusao
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
