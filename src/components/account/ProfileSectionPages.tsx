'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Copy,
  Heart,
  MapPin,
  Package,
  Plus,
  Shield,
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

type OrderStatus = 'aguardando_pagamento' | 'em_processamento' | 'enviado' | 'entregue' | 'cancelado';
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

const statusMeta: Record<OrderStatus, { label: string; color: string }> = {
  aguardando_pagamento: { label: 'Aguardando pagamento', color: '#ca8a04' },
  em_processamento: { label: 'Em processamento', color: '#3b82f6' },
  enviado: { label: 'Enviado', color: '#a855f7' },
  entregue: { label: 'Entregue', color: '#16a34a' },
  cancelado: { label: 'Cancelado', color: '#ef4444' },
};

function relativeDate(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'ha 1 dia';
  return `ha ${days} dias`;
}

export function OrdersPageClient() {
  const addItem = useCartStore((state) => state.addItem);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [status, setStatus] = useState('todos');
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

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

  function buyAgain(order: UserOrder) {
    order.items.forEach((item) => {
      addItem({
        id: item.productId,
        productId: item.productId,
        slug: item.slug,
        name: item.nome,
        image: item.thumbnail,
        price: item.preco,
        quantity: item.quantidade,
      });
    });
  }

  const tabs = ['todos', ...Object.keys(statusMeta)];

  if (loading) return <SkeletonCards />;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Meus Pedidos</h2>
          <p className="mt-1 text-sm text-zinc-500">{total} pedido(s) no total</p>
        </div>
        <input
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-sm text-white outline-none focus:border-brand/60 sm:w-64"
          placeholder="Buscar numero do pedido"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={cn(
              'shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition',
              status === tab ? 'bg-brand text-white' : 'bg-white/[0.04] text-zinc-400 hover:text-white',
            )}
            onClick={() => setStatus(tab)}
          >
            {tab === 'todos' ? 'Todos' : statusMeta[tab as OrderStatus].label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyPanel title="Voce ainda nao fez nenhum pedido" subtitle="Os apoios finalizados vao aparecer aqui." action={{ href: '/products', label: 'Explorar produtos' }} />
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const meta = statusMeta[order.status];
            const firstItem = order.items[0];
            const open = expanded === order.id;
            const steps = ['Confirmado', 'Pago', 'Enviado', 'Entregue'];
            const currentStep = order.status === 'aguardando_pagamento' ? 0 : order.status === 'em_processamento' ? 1 : order.status === 'enviado' ? 2 : order.status === 'entregue' ? 3 : 0;

            return (
              <article key={order.id} className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
                <button type="button" className="grid w-full gap-4 text-left sm:grid-cols-[5rem_1fr_auto]" onClick={() => setExpanded(open ? null : order.id)}>
                  <Image src={firstItem?.thumbnail ?? '/placeholder-product.svg'} alt={firstItem?.nome ?? 'Pedido'} width={80} height={80} className="size-20 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-semibold text-white">#{order.numero}</p>
                      <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: `${meta.color}26`, color: meta.color }}>
                        <span className={cn('size-2 rounded-full', ['aguardando_pagamento', 'enviado'].includes(order.status) && 'animate-pulse')} style={{ backgroundColor: meta.color }} />
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500" title={new Date(order.created_at).toLocaleString('pt-BR')}>
                      {relativeDate(order.created_at)}
                    </p>
                    <p className="mt-1 truncate text-sm text-zinc-400">{order.items.length} item(ns)</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="font-bold text-brand">{currencyFormatter.format(order.total)}</p>
                    <ChevronDown className={cn('size-5 text-zinc-500 transition', open && 'rotate-180')} />
                  </div>
                </button>

                {open ? (
                  <div className="mt-5 grid gap-5 border-t border-white/[0.06] pt-5">
                    <div className="grid gap-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
                          <Image src={item.thumbnail} alt={item.nome} width={48} height={48} className="size-12 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">{item.nome}</p>
                            <p className="text-xs text-zinc-500">Qtd. {item.quantidade}</p>
                          </div>
                          <p className="text-sm text-zinc-300">{currencyFormatter.format(item.preco * item.quantidade)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-3 text-sm text-zinc-400 md:grid-cols-2">
                      <div className="rounded-xl bg-white/[0.03] p-4">
                        <p className="mb-1 font-semibold text-white">Endereco de entrega</p>
                        <p>{order.endereco_entrega?.street}, {order.endereco_entrega?.number}</p>
                        <p>{order.endereco_entrega?.city}/{order.endereco_entrega?.state} - {order.endereco_entrega?.zip}</p>
                      </div>
                      <div className="rounded-xl bg-white/[0.03] p-4">
                        <p className="mb-1 font-semibold text-white">Metodo de pagamento</p>
                        <p className="capitalize">{order.metodo_pagamento}</p>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-4">
                      {steps.map((step, index) => (
                        <div key={step} className={cn('rounded-xl border p-3 text-center text-xs', index <= currentStep ? 'border-brand/30 bg-brand/10 text-white' : 'border-white/[0.06] text-zinc-600')}>
                          <span className={cn('mx-auto mb-2 block size-3 rounded-full', index === currentStep ? 'animate-pulse bg-brand' : index < currentStep ? 'bg-green-500' : 'bg-zinc-700')} />
                          {step}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary">Rastrear</Button>
                      {order.status === 'entregue' ? <Button onClick={() => buyAgain(order)}>Comprar novamente</Button> : null}
                      {order.status === 'aguardando_pagamento' ? <Button variant="ghost">Ver codigo Pix</Button> : null}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {cursor ? (
        <Button variant="secondary" loading={loadingMore} onClick={() => void load(cursor)}>
          Carregar mais
        </Button>
      ) : null}
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
