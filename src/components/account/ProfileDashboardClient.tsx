'use client';

import { OrderStatus } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Camera, Loader2, Package } from 'lucide-react';
import { StatusBadge } from '@/components/account/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { nameToBgColor, nameToTextColor, getCustomerLevel } from '@/lib/color';
import { cn } from '@/lib/utils';

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
  productImages: string[];
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
  activeCoupons?: number;
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const statusFilters = ['Todos', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return null;
  if (digits.length < 10 || digits.length > 11) return 'Telefone deve ter 10 ou 11 digitos.';
  return null;
}

function maskCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
}

type AddressFormData = {
  label: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

const emptyAddressForm: AddressFormData = {
  label: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zip: '',
  isDefault: false,
};

export function ProfileDashboardClient({ addresses, orders, user, wishlist, activeCoupons = 0 }: ProfileDashboardClientProps) {
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState(user.image ?? '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [displayName, setDisplayName] = useState(user.name ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const [addressList, setAddressList] = useState<AddressItem[]>(addresses);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormData>(emptyAddressForm);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('Todos');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => statusFilter === 'Todos' || order.status === statusFilter);
  }, [statusFilter, orders]);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

  const level = useMemo(() => getCustomerLevel(orders.length), [orders.length]);

  const initials = useMemo(() => {
    const n = displayName || user.email || 'U';
    return n.slice(0, 2).toUpperCase();
  }, [displayName, user.email]);

  const avatarBg = useMemo(() => nameToBgColor(displayName || user.email || 'U'), [displayName, user.email]);
  const avatarText = useMemo(() => nameToTextColor(displayName || user.email || 'U'), [displayName, user.email]);

  async function handleAvatarUpload(file?: File) {
    if (!file) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/account/avatar', { method: 'POST', body: formData });
      const data = (await response.json()) as { success: boolean; url?: string; error?: string };
      if (data.success && data.url) {
        setAvatarPreview(data.url);
        setToast({ message: 'Avatar atualizado com sucesso.', type: 'success' });
        router.refresh();
      } else {
        setToast({ message: data.error ?? 'Erro ao enviar avatar.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Erro ao enviar avatar.', type: 'error' });
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleSaveProfile() {
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setProfileError(phoneError);
      return;
    }
    setProfileError(null);
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName, phone }),
      });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (data.success) {
        setProfileMessage('Perfil atualizado com sucesso.');
        setToast({ message: 'Perfil atualizado com sucesso.', type: 'success' });
      } else {
        setProfileMessage(data.error ?? 'Erro ao salvar.');
        setToast({ message: data.error ?? 'Erro ao salvar.', type: 'error' });
      }
    } catch {
      setProfileMessage('Erro ao salvar. Tente novamente.');
      setToast({ message: 'Erro ao salvar. Tente novamente.', type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword() {
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('Preencha todos os campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('A nova senha e a confirmacao nao conferem.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('A nova senha deve ter no minimo 6 caracteres.');
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (data.success) {
        setPasswordMessage('Senha alterada com sucesso.');
        setToast({ message: 'Senha alterada com sucesso.', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage(data.error ?? 'Erro ao alterar senha.');
      }
    } catch {
      setPasswordMessage('Erro ao alterar senha. Tente novamente.');
    } finally {
      setPasswordSaving(false);
    }
  }

  function resetForm() {
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
    setShowAddressForm(false);
    setAddressError(null);
  }

  function handleEditAddress(address: AddressItem) {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label ?? '',
      street: address.street,
      number: address.number,
      complement: address.complement ?? '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zip: address.zip,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
    setAddressError(null);
  }

  async function handleSaveAddress() {
    const required = ['street', 'number', 'neighborhood', 'city', 'state', 'zip'] as const;
    const missing = required.find((f) => !addressForm[f]);
    if (missing) {
      setAddressError('Preencha todos os campos obrigatorios.');
      return;
    }

    setAddressSaving(true);
    setAddressError(null);

    try {
      const url = editingAddressId
        ? `/api/account/address/${editingAddressId}`
        : '/api/account/address';
      const method = editingAddressId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });
      const data = (await response.json()) as { success: boolean; address?: AddressItem; error?: string };

      if (data.success && data.address) {
        if (editingAddressId) {
          setAddressList((prev) => prev.map((a) => (a.id === editingAddressId ? { ...data.address!, isDefault: data.address!.isDefault } : a)));
        } else {
          setAddressList((prev) => [...prev, data.address!]);
        }
        setToast({ message: editingAddressId ? 'Endereco atualizado.' : 'Endereco adicionado.', type: 'success' });
        resetForm();
      } else {
        setAddressError(data.error ?? 'Erro ao salvar endereco.');
      }
    } catch {
      setAddressError('Erro ao salvar. Tente novamente.');
    } finally {
      setAddressSaving(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!confirm('Tem certeza que deseja excluir este endereco?')) return;

    try {
      const response = await fetch(`/api/account/address/${id}`, { method: 'DELETE' });
      const data = (await response.json()) as { success: boolean };

      if (data.success) {
        setAddressList((prev) => prev.filter((a) => a.id !== id));
        setToast({ message: 'Endereco excluido.', type: 'success' });
      }
    } catch {
      setToast({ message: 'Erro ao excluir endereco.', type: 'error' });
    }
  }

  return (
    <>
      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}

      <div className="grid gap-8">
        {/* Profile card + Resumo da conta */}
        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card p-6 md:grid md:grid-cols-[auto_1fr] md:gap-5">
            <div className="grid gap-3 justify-items-center">
              {/* Avatar */}
              {avatarPreview ? (
                <div className="grid gap-2 justify-items-center">
                  <Image src={avatarPreview} alt={displayName || 'Perfil'} width={96} height={96} className="size-24 rounded-full object-cover ring-2 ring-brand/30" />
                </div>
              ) : (
                <div className="grid gap-2 justify-items-center">
                  <div
                    className="grid size-24 place-items-center rounded-full text-3xl font-bold ring-2 ring-white/10"
                    style={{ backgroundColor: avatarBg, color: avatarText }}
                  >
                    {initials}
                  </div>
                </div>
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand/30 bg-brand/15 px-3 py-2 text-xs font-semibold text-brand transition hover:bg-brand/25">
                {avatarUploading ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Camera className="size-3.5" aria-hidden="true" />
                )}
                {avatarUploading ? 'Enviando...' : 'Alterar foto'}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={avatarUploading}
                  onChange={(event) => {
                    void handleAvatarUpload(event.target.files?.[0]);
                    event.currentTarget.value = '';
                  }}
                  aria-label="Alterar foto do perfil"
                />
              </label>
              <p className="text-center text-[11px] text-zinc-600">JPG, PNG, WEBP ou GIF ate 5MB</p>
            </div>

            <div className="grid gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-2xl font-semibold text-white">{displayName || 'Cliente'}</h2>
                    <span
                      className={cn('inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-xs font-medium shadow-[0_0_10px_rgba(249,115,22,0.2)] animate-pulse-led')}
                      title={
                        orders.length >= 15
                          ? 'Parabéns! Você atingiu o nível máximo!'
                          : `Faça ${15 - orders.length} pedido(s) para atingir Premium`
                      }
                    >
                      {level.icon} {level.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500">{user.email}</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Nome completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-brand/60 focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Telefone
                  </label>
                  <input
                    className={cn(
                      'w-full rounded-xl border px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-colors focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]',
                      profileError && profileError.includes('Telefone')
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-700 bg-zinc-800/50 focus:border-brand/60',
                    )}
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                  {profileError && profileError.includes('Telefone') ? (
                    <p className="mt-1 text-xs text-red-400">{profileError}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Cliente desde
                  </label>
                  <p className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-2.5 text-sm text-zinc-400">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Conta nova'}
                  </p>
                </div>
              </div>

              {profileMessage && !profileMessage.includes('sucesso') ? (
                <p className="text-sm text-red-400">{profileMessage}</p>
              ) : null}

              <div className="flex items-center gap-3">
                <Button
                  disabled={profileSaving}
                  onClick={handleSaveProfile}
                  className="shadow-led-brand hover:shadow-[0_0_20px_4px_#F9731670,0_0_50px_8px_#F9731630]"
                >
                  {profileSaving ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                      Salvando...
                    </span>
                  ) : 'Salvar perfil'}
                </Button>
              </div>
              <p className="mt-1 text-[11px] text-zinc-600">* Campos obrigatorios</p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="glass-card p-5">
            <h2 className="font-display text-xl font-semibold text-white">Resumo da conta</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/orders"
                className="group rounded-xl bg-white/[0.04] p-3 transition-all duration-300 hover:border-brand/30 hover:shadow-led-brand/30 border border-glass-border"
              >
                <p className="text-xs text-zinc-500">Total de pedidos</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-lg font-bold text-white transition-colors duration-200 group-hover:text-brand">{orders.length}</p>
                  <span className="text-zinc-600 transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
              <Link
                href="/profile?section=enderecos"
                className="group rounded-xl bg-white/[0.04] p-3 transition-all duration-300 hover:border-brand/30 hover:shadow-led-brand/30 border border-glass-border"
              >
                <p className="text-xs text-zinc-500">Enderecos salvos</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-lg font-bold text-white transition-colors duration-200 group-hover:text-brand">{addressList.length}</p>
                  <span className="text-zinc-600 transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
              <Link
                href="/profile?section=favoritos"
                className="group rounded-xl bg-white/[0.04] p-3 transition-all duration-300 hover:border-brand/30 hover:shadow-led-brand/30 border border-glass-border"
              >
                <p className="text-xs text-zinc-500">Favoritos</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-lg font-bold text-white transition-colors duration-200 group-hover:text-brand">{wishlist.length}</p>
                  <span className="text-zinc-600 transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
              <Link
                href="/profile?section=cupons"
                className="group rounded-xl bg-white/[0.04] p-3 transition-all duration-300 hover:border-brand/30 hover:shadow-led-brand/30 border border-glass-border"
              >
                <p className="text-xs text-zinc-500">Cupons disponiveis</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-lg font-bold text-white transition-colors duration-200 group-hover:text-brand">{activeCoupons}</p>
                  <span className="text-zinc-600 transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Ultimos pedidos */}
        {recentOrders.length > 0 ? (
          <section className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-white">Ultimos pedidos</h2>
              <Link href="/orders" className="text-sm font-medium text-brand transition hover:brightness-110">
                Ver todos →
              </Link>
            </div>
            <div className="grid gap-3">
              {recentOrders.map((order) => {
                const thumb = order.productImages[0];
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 transition-all duration-200 hover:border-brand/20 hover:bg-zinc-900/60"
                  >
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt=""
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs text-zinc-600">
                        N/A
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-mono text-sm text-white">#{order.id.slice(0, 8)}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} · {order.itemCount} item(ns) · {currencyFormatter.format(order.total)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-zinc-600">→</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="glass-card p-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-zinc-800/50">
              <Package className="size-7 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-500">Nenhum pedido realizado ainda.</p>
            <p className="mt-1 text-xs text-zinc-600">Seus pedidos aparecerão aqui depois da primeira compra.</p>
            <Link href="/products" className="mt-4 inline-flex h-10 items-center rounded-xl bg-brand px-6 text-sm font-bold text-white shadow-[0_0_16px_rgba(249,115,22,0.3)] transition hover:brightness-110">
              Explorar produtos
            </Link>
          </section>
        )}

        {/* Enderecos + Segurança */}
        <section className="grid gap-5 lg:grid-cols-2">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-white">Enderecos</h2>
              {!showAddressForm ? (
                <button className="rounded-xl border border-brand/30 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/10" type="button" onClick={() => { setShowAddressForm(true); setEditingAddressId(null); setAddressForm(emptyAddressForm); setAddressError(null); }}>
                  + Novo
                </button>
              ) : null}
            </div>

            {showAddressForm ? (
              <div className="mt-4 grid gap-3 rounded-xl border border-zinc-700/50 bg-zinc-900/80 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Label</label>
                    <input className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none" placeholder="Casa, Trabalho..." value={addressForm.label} onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">CEP <span className="text-red-400">*</span></label>
                    <input className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none" placeholder="00000-000" value={maskCep(addressForm.zip)} onChange={(e) => setAddressForm((p) => ({ ...p, zip: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Rua <span className="text-red-400">*</span></label>
                    <input className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none" placeholder="Nome da rua" value={addressForm.street} onChange={(e) => setAddressForm((p) => ({ ...p, street: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Numero <span className="text-red-400">*</span></label>
                    <input className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none" placeholder="123" value={addressForm.number} onChange={(e) => setAddressForm((p) => ({ ...p, number: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Complemento</label>
                    <input className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none" placeholder="Apto, bloco..." value={addressForm.complement} onChange={(e) => setAddressForm((p) => ({ ...p, complement: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Bairro <span className="text-red-400">*</span></label>
                    <input className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none" placeholder="Bairro" value={addressForm.neighborhood} onChange={(e) => setAddressForm((p) => ({ ...p, neighborhood: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Cidade <span className="text-red-400">*</span></label>
                    <input className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none" placeholder="Cidade" value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Estado <span className="text-red-400">*</span></label>
                    <input className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none" placeholder="UF" maxLength={2} value={addressForm.state} onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))} />
                  Endereco padrao
                </label>
                {addressError ? <p className="text-sm text-red-400">{addressError}</p> : null}
                <div className="flex gap-2">
                  <Button disabled={addressSaving} onClick={handleSaveAddress}>
                    {addressSaving ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                        Salvando...
                      </span>
                    ) : editingAddressId ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  <Button variant="ghost" onClick={resetForm}>Cancelar</Button>
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              {addressList.length > 0 ? (
                addressList.map((address) => (
                  <article key={address.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-400">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">
                          {address.isDefault ? '★ ' : null}
                          {address.label ?? 'Endereco'}
                        </p>
                        <p className="mt-1">{address.street}, {address.number} - {address.neighborhood}</p>
                        <p>{address.city}/{address.state} - {address.zip}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button className="text-xs font-medium text-brand transition hover:brightness-110" type="button" onClick={() => handleEditAddress(address)}>Editar</button>
                        <button className="text-xs font-medium text-red-400 transition hover:brightness-110" type="button" onClick={() => handleDeleteAddress(address.id)}>Deletar</button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <article className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-500">
                  <p className="font-medium text-zinc-400">Nenhum endereco cadastrado</p>
                  <p className="mt-1">Adicione um endereco para agilizar o checkout.</p>
                </article>
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="font-display text-xl font-semibold text-white">Segurança</h2>
            <div className="mt-4 grid gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Senha atual</label>
                <input className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Nova senha</label>
                <input className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Confirmar nova senha</label>
                <input className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Button disabled={passwordSaving} onClick={handleChangePassword}>
                  {passwordSaving ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                      Alterando...
                    </span>
                  ) : 'Trocar senha'}
                </Button>
                {passwordMessage ? (
                  <span className={passwordMessage.includes('sucesso') ? 'text-sm text-green-400' : 'text-sm text-red-400'}>
                    {passwordMessage}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Notificacoes */}
        <section className="glass-card p-5">
          <h2 className="font-display text-xl font-semibold text-white">Notificacoes</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            As notificacoes serao enviadas para o email cadastrado: <strong className="text-zinc-300">{user.email}</strong>
          </p>
          <p className="mt-1 text-xs text-zinc-600">Em breve: preferencias de notificacao no perfil.</p>
        </section>
      </div>
    </>
  );
}
