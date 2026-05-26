'use client';

import { OrderStatus } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Check, ChevronRight, Gift, Heart, Loader2, MapPin, Package, Pencil, Tag, X } from 'lucide-react';
import { StatusBadge } from '@/components/account/StatusBadge';
import { Button } from '@/components/ui/Button';
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

type CepStatus = 'idle' | 'loading' | 'success' | 'error';

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

type AutoFilledField = 'street' | 'complement' | 'neighborhood' | 'city' | 'state';

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
  const persistedAvatarRef = useRef(user.image ?? '');
  const avatarObjectUrlRef = useRef<string | null>(null);
  const cepAbortRef = useRef<AbortController | null>(null);
  const numberInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.image ?? '');
  const [avatarDragging, setAvatarDragging] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [displayName, setDisplayName] = useState(user.name ?? '');
  const [phone, setPhone] = useState(user.phone ? maskPhone(user.phone) : '');
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
  const [cepStatus, setCepStatus] = useState<CepStatus>('idle');
  const [cepError, setCepError] = useState<string | null>(null);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<AutoFilledField>>(new Set());

  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOrdersLoading(false));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) URL.revokeObjectURL(avatarObjectUrlRef.current);
      cepAbortRef.current?.abort();
    };
  }, []);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

  const level = useMemo(() => getCustomerLevel(orders.length), [orders.length]);

  const profileProgress = useMemo(() => {
    const items = [
      { label: 'nome', complete: Boolean(displayName.trim()) },
      { label: 'telefone', complete: Boolean(phone.replace(/\D/g, '')) },
      { label: 'foto', complete: Boolean(avatarPreview) },
      { label: 'endereco', complete: addressList.length > 0 },
    ];
    const complete = items.filter((item) => item.complete).length;
    return {
      percent: Math.round((complete / items.length) * 100),
      missing: items.filter((item) => !item.complete).map((item) => item.label),
    };
  }, [addressList.length, avatarPreview, displayName, phone]);

  const initials = useMemo(() => {
    const n = displayName || user.email || 'U';
    return n.slice(0, 2).toUpperCase();
  }, [displayName, user.email]);

  const avatarBg = useMemo(() => nameToBgColor(displayName || user.email || 'U'), [displayName, user.email]);
  const avatarText = useMemo(() => nameToTextColor(displayName || user.email || 'U'), [displayName, user.email]);
  const addressLimitReached = addressList.length >= 3 && !editingAddressId;

  const fetchCep = useCallback(async (cep: string) => {
    const raw = cep.replace(/\D/g, '');
    if (raw.length !== 8) return;

    cepAbortRef.current?.abort();
    const controller = new AbortController();
    cepAbortRef.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 5000);

    setCepStatus('loading');
    setCepError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${raw}/json/`, {
        signal: controller.signal,
      });
      const data = (await response.json()) as ViaCepResponse;

      if (data.erro) {
        setCepStatus('error');
        setCepError('CEP nao encontrado. Verifique e tente novamente.');
        return;
      }

      setAddressForm((current) => ({
        ...current,
        street: data.logradouro ?? current.street,
        neighborhood: data.bairro ?? current.neighborhood,
        city: data.localidade ?? current.city,
        state: data.uf ?? current.state,
        complement: data.complemento ?? current.complement,
      }));
      setAutoFilledFields(new Set<AutoFilledField>(['street', 'complement', 'neighborhood', 'city', 'state']));
      setCepStatus('success');
      window.setTimeout(() => numberInputRef.current?.focus(), 0);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError' && !timedOut) {
        return;
      }
      setCepStatus('error');
      setCepError(
        error instanceof DOMException && error.name === 'AbortError' && timedOut
          ? 'Tempo limite excedido. Tente novamente.'
          : 'Erro ao buscar CEP. Verifique sua conexao.',
      );
    } finally {
      window.clearTimeout(timeout);
      if (cepAbortRef.current === controller) cepAbortRef.current = null;
    }
  }, []);

  useEffect(() => {
    const raw = addressForm.zip.replace(/\D/g, '');
    if (raw.length !== 8) {
      setCepStatus('idle');
      setCepError(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetchCep(raw);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [addressForm.zip, fetchCep]);

  async function handleAvatarUpload(file?: File) {
    if (!file) return;
    if (avatarObjectUrlRef.current) URL.revokeObjectURL(avatarObjectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = objectUrl;
    setAvatarPreview(objectUrl);
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/account/avatar', { method: 'POST', body: formData });
      const data = (await response.json()) as { success: boolean; url?: string; error?: string };
      if (data.success && data.url) {
        if (avatarObjectUrlRef.current) {
          URL.revokeObjectURL(avatarObjectUrlRef.current);
          avatarObjectUrlRef.current = null;
        }
        persistedAvatarRef.current = data.url;
        setAvatarPreview(data.url);
        setToast({ message: 'Avatar atualizado com sucesso.', type: 'success' });
        router.refresh();
      } else {
        setAvatarPreview(persistedAvatarRef.current);
        setToast({ message: data.error ?? 'Erro ao enviar avatar.', type: 'error' });
      }
    } catch {
      setAvatarPreview(persistedAvatarRef.current);
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
    setCepError(null);
    setCepStatus('idle');
    setAutoFilledFields(new Set());
    cepAbortRef.current?.abort();
  }

  function clearAddressForm() {
    setAddressForm(emptyAddressForm);
    setAddressError(null);
    setCepError(null);
    setCepStatus('idle');
    setAutoFilledFields(new Set());
    cepAbortRef.current?.abort();
  }

  function handleCepChange(value: string) {
    cepAbortRef.current?.abort();
    setCepError(null);
    setCepStatus('idle');
    setAddressForm((current) => ({ ...current, zip: maskCep(value) }));
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
    setCepError(null);
    setCepStatus('idle');
    setAutoFilledFields(new Set());
  }

  async function handleSaveAddress() {
    if (addressLimitReached) {
      setAddressError('Voce pode salvar ate 3 enderecos.');
      return;
    }

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

  async function handleSetDefaultAddress(address: AddressItem) {
    try {
      const response = await fetch(`/api/account/address/${address.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = (await response.json()) as { success: boolean; address?: AddressItem; error?: string };

      if (data.success && data.address) {
        setAddressList((prev) => prev.map((item) => ({ ...item, isDefault: item.id === address.id })));
        setToast({ message: 'Endereco padrao atualizado.', type: 'success' });
      } else {
        setToast({ message: data.error ?? 'Erro ao definir endereco padrao.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Erro ao definir endereco padrao.', type: 'error' });
    }
  }

  return (
    <>
      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div className="grid min-w-0 gap-8">
          <section className="glass-card p-6">
            <div className="grid gap-6 md:grid-cols-[128px_minmax(0,1fr)] md:items-start">
              <div className="grid justify-items-center gap-3">
                <div
                  className={cn(
                    'relative size-24 rounded-full ring-2 ring-white/10 transition',
                    avatarDragging && 'ring-brand',
                  )}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setAvatarDragging(true);
                  }}
                  onDragLeave={() => setAvatarDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setAvatarDragging(false);
                    void handleAvatarUpload(event.dataTransfer.files?.[0]);
                  }}
                >
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt={displayName || 'Perfil'}
                      width={96}
                      height={96}
                      unoptimized={avatarPreview.startsWith('blob:')}
                      className="size-24 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="grid size-24 place-items-center rounded-full text-3xl font-bold"
                      style={{ backgroundColor: avatarBg, color: avatarText }}
                    >
                      {initials}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-950 bg-brand text-white shadow-[0_0_12px_rgba(255,107,0,0.45)] transition hover:brightness-110" title="Alterar foto">
                    {avatarUploading ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Camera className="size-3.5" aria-hidden="true" />
                    )}
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
                </div>
                <p className="max-w-28 text-center text-[11px] leading-4 text-zinc-600">
                  Arraste uma imagem ou clique na camera
                </p>
              </div>

              <div className="grid gap-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-2xl font-semibold text-white">{displayName || 'Cliente'}</h2>
                      <span
                        className="group relative inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-gradient-to-r from-amber-500/25 to-brand/25 px-3 py-1 text-xs font-semibold text-amber-100 shadow-[0_0_10px_rgba(255,107,0,0.2)]"
                        title={
                          orders.length >= 15
                            ? 'Parabéns! Você atingiu o nível máximo!'
                            : `Faça ${15 - orders.length} pedido(s) para atingir Premium`
                        }
                      >
                        Cliente Frequente 🧡
                        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-52 -translate-x-1/2 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-center text-[11px] font-medium text-zinc-300 opacity-0 shadow-xl transition group-hover:opacity-100">
                          {level.label}: beneficio calculado pelo historico de pedidos.
                        </span>
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-500">{user.email}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-white">Perfil {profileProgress.percent}% completo</p>
                    <p className="text-xs text-zinc-500">
                      {profileProgress.missing.length ? `Falta: ${profileProgress.missing.join(', ')}` : 'Tudo pronto'}
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${profileProgress.percent}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Nivel
                  </label>
                  <p className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-2.5 text-sm text-zinc-400">
                    {level.label}
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
          </section>

        {/* Ultimos pedidos */}
        {ordersLoading ? (
          <section className="glass-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="h-6 w-40 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-4 w-16 animate-pulse rounded bg-white/[0.06]" />
            </div>
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                  <div className="size-12 shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-white/[0.06]" />
                    <div className="h-3 w-56 max-w-full animate-pulse rounded bg-white/[0.06]" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : recentOrders.length > 0 ? (
          <section className="glass-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-white">Ultimos pedidos</h2>
              <Link href="/perfil/pedidos" className="text-sm font-medium text-brand transition hover:brightness-110">
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
                <button
                  className="rounded-xl border border-brand/30 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  disabled={addressList.length >= 3}
                  onClick={() => {
                    setShowAddressForm(true);
                    setEditingAddressId(null);
                    clearAddressForm();
                  }}
                >
                  + Adicionar endereço
                </button>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-zinc-600">{addressList.length}/3 endereços salvos</p>

            {showAddressForm ? (
              <div className="mt-4 grid gap-4 rounded-xl border border-zinc-700/50 bg-zinc-900/80 p-4">
                <div className="max-w-[180px]">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">Tipo</label>
                  <select
                    className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-white outline-none focus:border-brand/60"
                    value={addressForm.label}
                    onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))}
                    aria-label="Tipo do endereço"
                  >
                    <option value="">Outro</option>
                    <option value="Casa">Casa</option>
                    <option value="Trabalho">Trabalho</option>
                  </select>
                </div>

                <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">CEP <span className="text-red-400">*</span></label>
                    <div className="relative w-full md:w-[180px]">
                      <input
                        className={cn(
                          'h-11 w-full rounded-xl border bg-zinc-800/50 px-4 pr-10 text-sm text-white placeholder:text-zinc-600 transition-colors focus:outline-none',
                          cepStatus === 'error' ? 'border-red-500 focus:border-red-500' : 'border-zinc-700 focus:border-brand/60',
                          cepStatus === 'loading' && 'cursor-not-allowed opacity-70',
                        )}
                        placeholder="00000-000"
                        value={maskCep(addressForm.zip)}
                        disabled={cepStatus === 'loading'}
                        aria-label="CEP"
                        aria-busy={cepStatus === 'loading'}
                        onChange={(event) => handleCepChange(event.target.value)}
                        onPaste={(event) => {
                          event.preventDefault();
                          handleCepChange(event.clipboardData.getData('text'));
                        }}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        {cepStatus === 'loading' ? <Loader2 className="size-4 animate-spin text-brand" /> : null}
                        {cepStatus === 'success' ? <Check className="size-4 text-green-400" /> : null}
                        {cepStatus === 'error' ? <X className="size-4 text-red-400" /> : null}
                      </span>
                    </div>
                    <p className="mt-1 min-h-4 text-xs text-red-400" aria-live="polite">{cepError}</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Rua (Logradouro) <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input
                        className={cn(
                          'h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 pr-10 text-sm text-white placeholder:text-zinc-600 transition focus:border-brand/60 focus:outline-none',
                          autoFilledFields.has('street') && 'animate-fade-in bg-brand/10',
                        )}
                        placeholder="Nome da rua"
                        value={addressForm.street}
                        aria-label="Rua ou logradouro"
                        onChange={(event) => setAddressForm((current) => ({ ...current, street: event.target.value }))}
                      />
                      {autoFilledFields.has('street') ? <Pencil className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-brand/70" /> : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)]">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Número <span className="text-red-400">*</span></label>
                    <input
                      id="numero-input"
                      ref={numberInputRef}
                      className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-brand/60 focus:outline-none"
                      placeholder="123"
                      value={addressForm.number}
                      aria-label="Número"
                      onChange={(event) => setAddressForm((current) => ({ ...current, number: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Complemento</label>
                    <div className="relative">
                      <input
                        className={cn(
                          'h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 pr-10 text-sm text-white placeholder:text-zinc-600 transition focus:border-brand/60 focus:outline-none',
                          autoFilledFields.has('complement') && addressForm.complement && 'animate-fade-in bg-brand/10',
                        )}
                        placeholder="Apto 42, Bloco B"
                        value={addressForm.complement}
                        aria-label="Complemento"
                        onChange={(event) => setAddressForm((current) => ({ ...current, complement: event.target.value }))}
                      />
                      {autoFilledFields.has('complement') && addressForm.complement ? <Pencil className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-brand/70" /> : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_80px]">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Bairro <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input
                        className={cn(
                          'h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 pr-10 text-sm text-white placeholder:text-zinc-600 transition focus:border-brand/60 focus:outline-none',
                          autoFilledFields.has('neighborhood') && 'animate-fade-in bg-brand/10',
                        )}
                        placeholder="Bairro"
                        value={addressForm.neighborhood}
                        aria-label="Bairro"
                        onChange={(event) => setAddressForm((current) => ({ ...current, neighborhood: event.target.value }))}
                      />
                      {autoFilledFields.has('neighborhood') ? <Pencil className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-brand/70" /> : null}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Cidade <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input
                        className={cn(
                          'h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 pr-10 text-sm text-white placeholder:text-zinc-600 transition focus:border-brand/60 focus:outline-none',
                          autoFilledFields.has('city') && 'animate-fade-in bg-brand/10',
                        )}
                        placeholder="Cidade"
                        value={addressForm.city}
                        aria-label="Cidade"
                        onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))}
                      />
                      {autoFilledFields.has('city') ? <Pencil className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-brand/70" /> : null}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">UF <span className="text-red-400">*</span></label>
                    <input
                      className={cn(
                        'h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 text-center text-sm uppercase text-white placeholder:text-zinc-600 transition focus:border-brand/60 focus:outline-none read-only:cursor-default',
                        autoFilledFields.has('state') && 'animate-fade-in bg-brand/10',
                      )}
                      placeholder="UF"
                      maxLength={2}
                      readOnly={autoFilledFields.has('state') && Boolean(addressForm.state)}
                      value={addressForm.state}
                      aria-label="Estado UF"
                      onChange={(event) => setAddressForm((current) => ({ ...current, state: event.target.value.toUpperCase() }))}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    aria-label="Definir endereço como padrão"
                    onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                  />
                  Endereco padrao
                </label>
                <button type="button" className="w-fit text-xs font-medium text-zinc-500 transition hover:text-zinc-300" onClick={clearAddressForm}>
                  Limpar endereço
                </button>
                {addressError ? <p className="text-sm text-red-400">{addressError}</p> : null}
                <div className="flex gap-2">
                  <Button disabled={addressSaving || addressLimitReached} onClick={handleSaveAddress}>
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
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">{address.label || 'Outro'}</p>
                          {address.isDefault ? (
                            <span className="rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                              Padrão
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1">{address.street}, {address.number} - {address.neighborhood}</p>
                        <p>{address.city}/{address.state} - {address.zip}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {!address.isDefault ? (
                          <button className="text-xs font-medium text-zinc-300 transition hover:text-brand" type="button" onClick={() => void handleSetDefaultAddress(address)}>
                            Definir como padrão
                          </button>
                        ) : null}
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
              {!showAddressForm && addressList.length > 0 && addressList.length < 3 ? (
                <button
                  className="rounded-xl border border-dashed border-brand/30 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10"
                  type="button"
                  onClick={() => {
                    setShowAddressForm(true);
                    setEditingAddressId(null);
                    clearAddressForm();
                  }}
                >
                  + Adicionar endereço
                </button>
              ) : null}
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

        <aside className="glass-card h-fit p-5 xl:sticky xl:top-24">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-white">Resumo da conta</h2>
            <Gift className="size-5 text-brand" aria-hidden="true" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { href: '/perfil/pedidos', label: 'Total de pedidos', value: orders.length, icon: Package },
              { href: '/perfil/enderecos', label: 'Enderecos salvos', value: addressList.length, icon: MapPin },
              { href: '/perfil/favoritos', label: 'Favoritos', value: wishlist.length, icon: Heart },
              { href: '/perfil/cupons', label: 'Cupons disponiveis', value: activeCoupons, icon: Tag },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <Link
                  key={metric.href}
                  href={metric.href}
                  className="group grid min-h-[118px] rounded-xl border border-white/[0.06] bg-white/[0.04] p-3 transition-all duration-200 hover:border-brand/40 hover:bg-brand/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-zinc-950/60 text-brand">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <ChevronRight className="size-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden="true" />
                  </div>
                  <div className="self-end">
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="mt-1 text-xs leading-4 text-zinc-500">{metric.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </>
  );
}
