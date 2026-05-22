'use client';

import { OrderStatus } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { StatusBadge } from '@/components/account/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cart';

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

type WishlistItem = {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
  };
};

type OrderItem = {
  id: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
};

type ProfileDashboardClientProps = {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
    createdAt?: string | null;
  };
  addresses: AddressItem[];
  wishlist: WishlistItem[];
  orders: OrderItem[];
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const statusFilters = ['Todos', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

const fallbackWishlist: WishlistItem[] = [
  {
    id: 'wish-camiseta',
    product: {
      id: 'prod-camiseta-algodao-preta',
      name: 'Camiseta Algodao Preta Cafe Store',
      slug: 'camiseta-algodao-preta-cafe-store',
      images: ['/images/produtos/camisa_normal/preta/banner.png'],
      price: 89.9,
    },
  },
  {
    id: 'wish-caneca',
    product: {
      id: 'prod-caneca-preta',
      name: 'Caneca Preta Cafe Store',
      slug: 'caneca-preta-cafe-store',
      images: ['/images/produtos/caneca/preta/banner.png'],
      price: 49.9,
    },
  },
];

const fallbackOrders: OrderItem[] = [
  {
    id: 'CAF-2026-001',
    status: 'DELIVERED',
    total: 189.8,
    paymentMethod: 'pix',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    itemCount: 2,
  },
  {
    id: 'CAF-2026-002',
    status: 'SHIPPED',
    total: 119.9,
    paymentMethod: 'mercadopago',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    itemCount: 1,
  },
];

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

function maskCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function getClientLevel(totalSpent: number) {
  if (totalSpent >= 500) return { label: 'Cliente VIP', next: 800 };
  if (totalSpent >= 250) return { label: 'Cliente Gold', next: 500 };
  return { label: 'Novo cliente', next: 250 };
}

export function ProfileDashboardClient({ addresses, orders, user, wishlist }: ProfileDashboardClientProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [avatarPreview, setAvatarPreview] = useState(user.image ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [displayName, setDisplayName] = useState(user.name ?? '');
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('Todos');
  const [periodFilter, setPeriodFilter] = useState('90d');
  const [twoFactor, setTwoFactor] = useState(false);
  const [preferences, setPreferences] = useState({
    promoEmail: true,
    deliverySms: true,
    pushNews: false,
    priceDrop: true,
    frequency: 'semanal',
  });

  const visibleWishlist = wishlist.length > 0 ? wishlist : fallbackWishlist;
  const visibleOrders = orders.length > 0 ? orders : fallbackOrders;
  const totalSpent = visibleOrders.reduce((sum, order) => sum + order.total, 0);
  const currentMonthSpent = visibleOrders
    .filter((order) => new Date(order.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, order) => sum + order.total, 0);
  const level = getClientLevel(totalSpent);
  const levelProgress = Math.min(100, (totalSpent / level.next) * 100);
  const filteredOrders = useMemo(() => {
    return visibleOrders.filter((order) => statusFilter === 'Todos' || order.status === statusFilter);
  }, [statusFilter, visibleOrders]);

  function handleAvatarChange(file?: File) {
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleAddWishlistToCart(item: WishlistItem) {
    addItem({
      id: `${item.product.id}-wishlist`,
      productId: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      image: item.product.images[0] ?? '/placeholder-product.svg',
      price: item.product.price,
      quantity: 1,
      stock: 10,
    });
  }

  function handleBuyAgain(order: OrderItem) {
    addItem({
      id: `${order.id}-recompra`,
      productId: 'prod-camiseta-algodao-preta',
      slug: 'camiseta-algodao-preta-cafe-store',
      name: 'Recompra CAFÉ Store',
      image: '/images/produtos/camisa_normal/preta/banner.png',
      price: order.total / Math.max(1, order.itemCount),
      quantity: order.itemCount,
      stock: 20,
    });
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-card border border-border-subtle bg-background-card p-6 md:grid md:grid-cols-[auto_1fr] md:gap-5">
          <div className="grid gap-3 justify-items-center">
            {avatarPreview ? (
              <div className="relative">
                <Image src={avatarPreview} alt={displayName || 'Perfil'} width={96} height={96} className="size-24 rounded-full object-cover ring-2 ring-cafe-orange-500/30" />
                <label className="absolute bottom-0 right-0 grid size-8 cursor-pointer place-items-center rounded-full bg-cafe-orange-500 text-white shadow-lg transition hover:bg-cafe-orange-400">
                  <span className="text-xs">📷</span>
                  <input className="sr-only" type="file" accept="image/*" onChange={(event) => handleAvatarChange(event.target.files?.[0])} />
                </label>
              </div>
            ) : (
              <div className="relative">
                <div className="grid size-24 place-items-center rounded-full bg-cafe-orange-500/10 text-3xl font-semibold text-cafe-orange-500 ring-2 ring-cafe-orange-500/30">
                  {(displayName || user.email || 'U').slice(0, 1).toUpperCase()}
                </div>
                <label className="absolute bottom-0 right-0 grid size-8 cursor-pointer place-items-center rounded-full bg-cafe-orange-500 text-white shadow-lg transition hover:bg-cafe-orange-400">
                  <span className="text-xs">📷</span>
                  <input className="sr-only" type="file" accept="image/*" onChange={(event) => handleAvatarChange(event.target.files?.[0])} />
                </label>
              </div>
            )}
          </div>
          <div className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge>{level.label} 🏆</Badge>
                <h2 className="mt-2 font-display text-2xl font-semibold text-text-primary">{displayName || 'Cliente Cafe Store'}</h2>
                <p className="mt-1 text-sm text-text-muted">{user.email}</p>
              </div>
              <button type="button" className="btn-secondary px-4 py-2 text-sm">
                Editar perfil
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Nome completo" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              <Input label="Apelido" placeholder="Como quer aparecer na loja" />
              <Input label="Telefone" value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} placeholder="(00) 00000-0000" />
              <Input label="CPF" value={cpf} onChange={(event) => setCpf(maskCpf(event.target.value))} placeholder="000.000.000-00" />
              <Input label="Data de nascimento" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
              <Input label="Cliente desde" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Conta nova'} readOnly />
            </div>
          </div>
        </div>

        <div className="rounded-card border border-border-subtle bg-background-card p-5">
          <h2 className="font-display text-xl font-semibold text-text-primary">Dashboard pessoal</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-cafe-dark-700 p-3">
              <p className="text-xs text-text-muted">Gasto histórico</p>
              <p className="mt-1 text-lg font-bold text-text-primary">{currencyFormatter.format(totalSpent)}</p>
            </div>
            <div className="rounded-lg bg-cafe-dark-700 p-3">
              <p className="text-xs text-text-muted">Mês atual</p>
              <p className="mt-1 text-lg font-bold text-text-primary">{currencyFormatter.format(currentMonthSpent)}</p>
            </div>
            <div className="rounded-lg bg-cafe-dark-700 p-3">
              <p className="text-xs text-text-muted">Produto favorito</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">Camiseta CAFÉ</p>
            </div>
            <div className="rounded-lg bg-cafe-dark-700 p-3">
              <p className="text-xs text-text-muted">Categoria</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">Camisetas</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-cafe-orange-500">Você está no top 10% dos clientes mais fiéis.</p>
          <div className="mt-3 grid gap-2">
            <div className="h-2 overflow-hidden rounded-full bg-cafe-dark-700">
              <div className="h-full rounded-full bg-cafe-orange-500 transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
            <p className="text-xs text-text-muted">Faltam {currencyFormatter.format(Math.max(0, level.next - totalSpent))} para o próximo nível.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="card grid gap-5 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-text-primary">Enderecos</h2>
            <button className="btn-secondary px-4 py-2 text-sm" type="button">+ Adicionar novo endereco</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="CEP" placeholder="00000-000" />
            <Input label="Label" placeholder="Casa, Trabalho..." />
            <Input label="Rua" placeholder="Auto-preenchida pelo CEP" />
            <Input label="Numero" placeholder="123" />
            <Input label="Complemento" placeholder="Apto, bloco..." />
            <Input label="Bairro" placeholder="Auto-preenchido" />
            <Input label="Cidade" placeholder="Auto-preenchida" />
            <Input label="Estado" placeholder="UF" maxLength={2} />
          </div>
          <div className="grid gap-3">
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <article key={address.id} className="rounded-xl border border-white/10 p-4 text-sm text-text-secondary">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">
                        {address.isDefault ? '★ ' : null}
                        {address.label ?? 'Endereco'}
                      </p>
                      <p className="mt-2">{address.street}, {address.number} - {address.neighborhood}</p>
                      <p>{address.city}/{address.state} - {address.zip}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-accent-glow" type="button">Editar</button>
                      <button className="text-status-error" type="button">Deletar</button>
                    </div>
                  </div>
                  <div className="mt-3 grid h-24 place-items-center rounded-xl bg-gradient-to-br from-background-surface to-background-card text-xs text-text-muted">
                    Mapa miniatura: pin em {address.city}
                  </div>
                </article>
              ))
            ) : (
              <article className="rounded-xl border border-white/10 p-4 text-sm text-text-secondary">
                <p className="font-semibold text-text-primary">Casa ★</p>
                <p className="mt-2">Cadastre seu primeiro endereco para agilizar o checkout.</p>
                <div className="mt-3 grid h-24 place-items-center rounded-xl bg-gradient-to-br from-background-surface to-background-card text-xs text-text-muted">
                  Mapa miniatura aparece depois do CEP.
                </div>
              </article>
            )}
          </div>
        </div>

        <div className="card grid gap-5 p-5">
          <h2 className="font-display text-2xl font-semibold text-text-primary">Seguranca</h2>
          <div className="grid gap-3">
            <Input label="Senha atual" type="password" />
            <Input label="Nova senha" type="password" />
            <Input label="Confirmar nova senha" type="password" />
            <button className="btn-secondary w-fit px-4 py-2 text-sm" type="button">Trocar senha</button>
          </div>
          <label className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm text-text-secondary">
            Autenticacao em dois fatores
            <input type="checkbox" checked={twoFactor} onChange={(event) => setTwoFactor(event.target.checked)} />
          </label>
          <div className="grid gap-3 text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">Sessoes ativas</p>
            {['Chrome no Windows - Sao Paulo', 'Safari no iPhone - Campinas'].map((session) => (
              <div key={session} className="flex justify-between gap-3 rounded-xl bg-background-surface p-3">
                <span>{session}</span>
                <button className="text-status-error" type="button">Encerrar</button>
              </div>
            ))}
            <button className="btn-ghost w-fit px-4 py-2 text-sm" type="button">Encerrar todas as sessoes</button>
          </div>
          <div className="grid gap-2 text-xs text-text-muted">
            <p>Historico: hoje 09:42 Sao Paulo, ontem 21:10 dispositivo conhecido.</p>
            <p>Alertas de novo dispositivo ficam ativos por email automaticamente.</p>
          </div>
        </div>
      </section>

      <section className="card grid gap-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-text-primary">Historico de pedidos</h2>
          <div className="flex flex-wrap gap-2">
            <select className="input-field w-auto" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
              {statusFilters.map((status) => (
                <option key={status} value={status}>{status === 'Todos' ? 'Todos' : status}</option>
              ))}
            </select>
            <select className="input-field w-auto" value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)}>
              <option value="30d">30 dias</option>
              <option value="90d">90 dias</option>
              <option value="all">Todo periodo</option>
            </select>
          </div>
        </div>
        <div className="grid gap-3">
          {filteredOrders.map((order) => (
            <article key={order.id} className="grid gap-4 rounded-xl border border-white/10 p-4 md:grid-cols-[1fr_auto]">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-mono text-sm text-text-primary">Pedido {order.id}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-text-secondary">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR')} · {order.itemCount} itens · {currencyFormatter.format(order.total)}
                </p>
                <p className="text-xs text-text-muted">Itens resumidos: produtos oficiais CAFÉ Store.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/orders/${order.id}`} className="btn-secondary px-4 py-2 text-sm">Rastrear</Link>
                <button className="btn-ghost px-4 py-2 text-sm" type="button" onClick={() => handleBuyAgain(order)}>Comprar novamente</button>
                {order.status === 'DELIVERED' ? <button className="btn-ghost px-4 py-2 text-sm" type="button">Avaliar produtos</button> : null}
                <button className="btn-ghost px-4 py-2 text-sm" type="button">Nota fiscal</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card grid gap-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-text-primary">Lista de desejos</h2>
            <button className="btn-secondary px-4 py-2 text-sm" type="button">Compartilhar lista</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Quero comprar', 'Presentes', 'Comparando'].map((list) => <Badge key={list} variant="muted">{list}</Badge>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleWishlist.map((item, index) => (
              <article key={item.id} className="rounded-xl border border-white/10 p-3">
                <Link href={`/products/${item.product.slug}`} className="relative block aspect-square overflow-hidden rounded-xl bg-background-surface">
                  <Image src={item.product.images[0] ?? '/placeholder-product.svg'} alt={item.product.name} fill sizes="180px" className="object-cover" />
                </Link>
                <p className="mt-3 text-sm font-semibold text-text-primary">{item.product.name}</p>
                <p className="mt-1 text-sm text-accent-glow">{currencyFormatter.format(item.product.price)}</p>
                {index === 0 ? <p className="mt-1 text-xs text-status-success">Baixou R$ 20 desde que voce favoritou.</p> : null}
                <button className="btn-secondary mt-3 w-full px-4 py-2 text-sm" type="button" onClick={() => handleAddWishlistToCart(item)}>
                  Adicionar ao carrinho
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <section className="card grid gap-4 p-5">
            <h2 className="font-display text-2xl font-semibold text-text-primary">Pagamentos salvos</h2>
            {['Visa final 4242 · padrao', 'Mastercard final 1881'].map((card) => (
              <div key={card} className="flex justify-between gap-3 rounded-xl border border-white/10 p-3 text-sm text-text-secondary">
                <span>{card}</span>
                <button className="text-status-error" type="button">Remover</button>
              </div>
            ))}
            <Input label="Novo cartao" placeholder="Numero do cartao seguro" />
            <p className="text-sm text-accent-glow">Voce tem R$ 45 de cashback disponivel.</p>
          </section>

          <section className="card grid gap-4 p-5">
            <h2 className="font-display text-2xl font-semibold text-text-primary">Fidelidade</h2>
            <p className="text-sm text-text-secondary">1.240 pontos acumulados. Beneficios: frete gratis acima de R$ 99, cupons antecipados e suporte prioritario.</p>
            <div className="h-3 overflow-hidden rounded-full bg-background-surface">
              <div className="h-full w-2/3 rounded-full bg-accent-primary" />
            </div>
            <div className="grid gap-2 text-xs text-text-muted">
              <p>+120 pontos por compra entregue</p>
              <p>-300 pontos usados em cupom</p>
              <p>Cupom VIP20 valido ate 30/06/2026</p>
            </div>
          </section>
        </div>
      </section>

      <section className="card grid gap-5 p-5">
        <h2 className="font-display text-2xl font-semibold text-text-primary">Notificacoes e preferencias</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ['promoEmail', 'Email de promocoes'],
            ['deliverySms', 'SMS de entrega'],
            ['pushNews', 'Push de novidades'],
            ['priceDrop', 'Alerta de favorito com preco baixo'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm text-text-secondary">
              {label}
              <input
                type="checkbox"
                checked={Boolean(preferences[key as keyof typeof preferences])}
                onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))}
              />
            </label>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-text-secondary">
            Frequencia de email
            <select className="input-field" value={preferences.frequency} onChange={(event) => setPreferences((current) => ({ ...current, frequency: event.target.value }))}>
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="essencial">So o essencial</option>
            </select>
          </label>
          <Input label="Categorias preferidas" placeholder="Camisetas, canecas, moletons" />
        </div>
      </section>
    </div>
  );
}
