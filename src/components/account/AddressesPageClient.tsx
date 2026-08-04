'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, MapPin, Pencil, Plus, Star, Trash2, X } from 'lucide-react';

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

const MAX_ADDRESSES = 5;
const emptyForm = { label: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: '' };

const cardVariants: import('framer-motion').Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.07, ease: 'easeOut' as const } }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.18 } },
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">{children}</label>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-brand/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.12)] disabled:opacity-50"
    />
  );
}

function AddressCard({ address, index, onEdit, onDelete, onSetDefault }: {
  address: AddressItem;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  return (
    <motion.article
      layout
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_8px_32px_rgba(249,115,22,0.08)]"
    >
      {/* top accent line on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
            <MapPin className="size-4" />
          </span>
          <div>
            <p className="font-semibold leading-tight text-white">{address.label || 'Endereço'}</p>
            {address.isDefault && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                <Star className="size-2.5 fill-current" /> Padrão
              </span>
            )}
          </div>
        </div>

        {/* Action buttons top-right */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar endereço"
            className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Remover endereço"
            className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Address body */}
      <div className="space-y-0.5 text-sm leading-6 text-zinc-400">
        <p className="text-zinc-300">
          {address.street}, {address.number}
          {address.complement ? <span className="text-zinc-500"> — {address.complement}</span> : null}
        </p>
        <p>{address.neighborhood}</p>
        <p>
          {address.city} / <span className="font-semibold text-zinc-300">{address.state}</span>
          <span className="ml-2 font-mono text-xs text-zinc-500">{address.zip}</span>
        </p>
      </div>

      {/* Set default */}
      {!address.isDefault && (
        <button
          type="button"
          onClick={onSetDefault}
          className="self-start rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs font-semibold text-zinc-500 transition hover:border-brand/30 hover:text-brand"
        >
          Tornar padrão
        </button>
      )}
    </motion.article>
  );
}

function AddressModal({ editing, form, setForm, onClose, onSubmit, saving, numberRef }: {
  editing: AddressItem | null;
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  onClose: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  saving: boolean;
  numberRef: React.RefObject<HTMLInputElement>;
}) {
  async function handleCep(value: string) {
    const zip = value.replace(/\D/g, '').slice(0, 8);
    setForm((f) => ({ ...f, zip: zip.replace(/^(\d{5})(\d)/, '$1-$2') }));
    if (zip.length !== 8) return;
    const res = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
    const data = await res.json();
    if (!data.erro) {
      setForm((f) => ({
        ...f,
        street: data.logradouro ?? f.street,
        neighborhood: data.bairro ?? f.neighborhood,
        city: data.localidade ?? f.city,
        state: data.uf ?? f.state,
      }));
      numberRef.current?.focus();
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={editing ? 'Editar endereço' : 'Adicionar endereço'}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e0e] shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand">
              <MapPin className="size-4" />
            </span>
            <h3 className="font-semibold text-white">{editing ? 'Editar endereço' : 'Novo endereço'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="grid gap-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Apelido (ex: Casa, Trabalho)">
              <Input placeholder="Casa" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </Field>
            <Field label="CEP">
              <Input placeholder="00000-000" value={form.zip} onChange={(e) => void handleCep(e.target.value)} />
            </Field>
          </div>

          <Field label="Logradouro">
            <Input className="sm:col-span-2" placeholder="Rua, Avenida..." value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Número *">
              <Input ref={numberRef} placeholder="123" required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            </Field>
            <Field label="Complemento">
              <Input placeholder="Apto, Bloco..." value={form.complement ?? ''} onChange={(e) => setForm({ ...form, complement: e.target.value })} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Bairro">
              <Input placeholder="Bairro" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
            </Field>
            <Field label="Cidade">
              <Input placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label="Estado">
              <Input placeholder="UF" maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-semibold text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white transition-all hover:bg-orange-500 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? 'Salvando...' : 'Salvar endereço'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function DeleteModal({ onConfirm, onCancel, deleting }: { onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      role="dialog" aria-modal="true"
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#0e0e0e] p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.18 }}
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-400">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold text-white">Remover endereço?</h3>
            <p className="mt-1 text-sm text-zinc-400">Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-semibold text-zinc-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition hover:brightness-90 disabled:opacity-60"
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Remover
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="flex items-center gap-3">
        <div className="size-9 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="h-4 w-28 animate-pulse rounded bg-white/[0.06]" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-3/4 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" />
      </div>
    </div>
  );
}

export function AddressesPageClient() {
  const numberRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<AddressItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<AddressItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const limitReached = items.length >= MAX_ADDRESSES && !editing;

  async function load() {
    setLoading(true);
    const res = await fetch('/api/user/addresses');
    const json = await res.json();
    setItems(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

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
    } : emptyForm);
    setModalOpen(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/user/addresses/${editing.id}` : '/api/user/addresses';
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    setModalOpen(false);
    await load();
  }

  async function remove() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/user/addresses/${deleteId}`, { method: 'DELETE' });
    setDeleting(false);
    setDeleteId(null);
    await load();
  }

  async function setDefault(id: string) {
    await fetch(`/api/user/addresses/${id}/default`, { method: 'PATCH' });
    await load();
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Endereços</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {loading ? '...' : `${items.length} / ${MAX_ADDRESSES} endereços salvos`}
          </p>
        </div>
        <button
          type="button"
          disabled={limitReached}
          title={limitReached ? `Limite de ${MAX_ADDRESSES} endereços atingido` : undefined}
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition-all duration-200 hover:bg-brand hover:text-white hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.25)] disabled:cursor-not-allowed disabled:opacity-40 disabled:translate-y-0"
        >
          <Plus className="size-4" />
          Adicionar endereço
        </button>
      </motion.div>

      <div className="h-px bg-gradient-to-r from-brand/40 via-brand/20 to-transparent" />

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-12 text-center"
        >
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
            <MapPin className="size-7" />
          </span>
          <h3 className="font-semibold text-white">Nenhum endereço salvo</h3>
          <p className="mt-2 text-sm text-zinc-500">Adicione um endereço para agilizar seus pedidos.</p>
          <button
            type="button"
            onClick={() => openForm()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
          >
            <Plus className="size-4" /> Adicionar primeiro endereço
          </button>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {items.map((address, i) => (
              <AddressCard
                key={address.id}
                address={address}
                index={i}
                onEdit={() => openForm(address)}
                onDelete={() => setDeleteId(address.id)}
                onSetDefault={() => void setDefault(address.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {modalOpen && (
          <AddressModal
            key="address-modal"
            editing={editing}
            form={form}
            setForm={setForm}
            onClose={() => setModalOpen(false)}
            onSubmit={submit}
            saving={saving}
            numberRef={numberRef}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <DeleteModal
            key="delete-modal"
            onConfirm={() => void remove()}
            onCancel={() => setDeleteId(null)}
            deleting={deleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
