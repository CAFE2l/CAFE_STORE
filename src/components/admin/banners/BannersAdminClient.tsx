'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CalendarClock, GripVertical, ImagePlus, Loader2, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkLabel: string | null;
  position: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type BannerForm = {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkLabel: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
};

const emptyForm: BannerForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  linkLabel: '',
  active: true,
  startsAt: '',
  endsAt: '',
};

function dateTimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function displayDate(value: string | null) {
  if (!value) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getStatus(banner: Banner) {
  const now = Date.now();
  const starts = banner.startsAt ? new Date(banner.startsAt).getTime() : null;
  const ends = banner.endsAt ? new Date(banner.endsAt).getTime() : null;

  if (!banner.active) return { label: 'Inativo', className: 'border-white/10 bg-white/5 text-zinc-300' };
  if (starts && starts > now) return { label: 'Agendado', className: 'border-sky-400/20 bg-sky-400/10 text-sky-300' };
  if (ends && ends < now) return { label: 'Expirado', className: 'border-white/10 bg-white/5 text-zinc-300' };
  return { label: 'Ativo agora', className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' };
}

function toPayload(form: BannerForm) {
  return {
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || null,
    imageUrl: form.imageUrl.trim(),
    linkUrl: form.linkUrl.trim() || null,
    linkLabel: form.linkLabel.trim() || null,
    active: form.active,
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
  };
}

function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full border transition',
        checked ? 'border-orange-400/40 bg-orange-500' : 'border-white/10 bg-white/10',
        disabled && 'cursor-wait opacity-60',
      )}
    >
      <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white transition', checked ? 'left-6' : 'left-1')} />
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-white/75">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-400/60 focus:ring-2 focus:ring-orange-500/20"
      />
    </label>
  );
}

export function BannersAdminClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deleteBanner = useMemo(() => banners.find((banner) => banner.id === deleteId) ?? null, [banners, deleteId]);

  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(banner: Banner) {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? '',
      linkLabel: banner.linkLabel ?? '',
      active: banner.active,
      startsAt: dateTimeLocal(banner.startsAt),
      endsAt: dateTimeLocal(banner.endsAt),
    });
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving || uploading) return;
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setError(null);
  }

  async function refresh() {
    const response = await fetch('/api/admin/banners', { cache: 'no-store' });
    const json = await response.json();
    if (json.success) setBanners(json.data);
  }

  async function saveBanner() {
    setError(null);
    const payload = toPayload(form);
    if (!payload.title || !payload.imageUrl) {
      setError('Informe titulo e imagem.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(editing ? `/api/admin/banners/${editing.id}` : '/api/admin/banners', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setError(json.error ?? 'Nao foi possivel salvar.');
        return;
      }

      await refresh();
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(banner: Banner) {
    setBanners((current) => current.map((item) => (item.id === banner.id ? { ...item, active: !item.active } : item)));
    const response = await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...banner, active: !banner.active }),
    });

    if (!response.ok) setBanners((current) => current.map((item) => (item.id === banner.id ? banner : item)));
  }

  async function handleDelete() {
    if (!deleteId) return;
    const currentId = deleteId;
    setDeleteId(null);
    setBanners((current) => current.filter((banner) => banner.id !== currentId));
    const response = await fetch(`/api/admin/banners/${currentId}`, { method: 'DELETE' });
    if (!response.ok) await refresh();
  }

  async function handleReorder(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }

    const next = [...banners];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    const ordered = next.map((banner, index) => ({ ...banner, position: index }));
    setBanners(ordered);
    setDragIndex(null);

    const response = await fetch('/api/admin/banners/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: ordered.map((banner) => banner.id) }),
    });

    if (!response.ok) await refresh();
  }

  async function uploadImage(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setError(json.error ?? 'Falha no upload. Cole uma URL externa.');
        return;
      }

      setForm((current) => ({ ...current, imageUrl: json.data.url }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Banners</h1>
          <p className="mt-2 text-sm text-zinc-500">Controle de vitrines, campanhas e ordem de exibicao.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(249,115,22,0.3)] transition-all hover:scale-[1.02] hover:bg-orange-400 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Novo banner
        </button>
      </header>

      {banners.length ? (
        <div className="grid gap-3 rounded-xl border border-white/10 bg-black/25 p-3 shadow-card backdrop-blur">
          {banners.map((banner, index) => {
            const status = getStatus(banner);
            return (
              <div
                key={banner.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => void handleReorder(index)}
                className="group flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 transition-all hover:border-white/[0.12] md:flex-row md:items-center"
              >
                <button type="button" className="hidden cursor-grab text-white/25 transition group-hover:text-white/50 md:block" aria-label="Reordenar banner">
                  <GripVertical className="h-5 w-5" />
                </button>
                <img src={banner.imageUrl} alt={banner.title} className="h-24 w-full rounded-lg object-cover md:h-20 md:w-20" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{banner.title}</p>
                  {banner.subtitle ? <p className="mt-1 line-clamp-1 text-xs text-zinc-400">{banner.subtitle}</p> : null}
                  {banner.linkUrl ? <p className="mt-1 truncate text-xs text-orange-300/80">{banner.linkUrl}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-500">
                    <span>Inicio: {displayDate(banner.startsAt)}</span>
                    <span>Fim: {displayDate(banner.endsAt)}</span>
                  </div>
                </div>
                <span className={cn('inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium', status.className)}>{status.label}</span>
                <Toggle checked={banner.active} onChange={() => void toggleActive(banner)} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(banner)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-white/50 transition-all hover:bg-white/[0.10] hover:text-white"
                    aria-label="Editar banner"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(banner.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-white/50 transition-all hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-400"
                    aria-label="Deletar banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid place-items-center rounded-xl border border-white/10 bg-black/25 px-6 py-16 text-center shadow-card backdrop-blur">
          <div className="max-w-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-300">
              <ImagePlus className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-white">Nenhum banner cadastrado</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Crie seu primeiro banner para exibir na loja.</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-300 transition-all hover:bg-orange-500/30"
            >
              <Plus className="h-4 w-4" />
              Criar primeiro banner
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {modalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => event.target === event.currentTarget && closeModal()}
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101010] p-5 shadow-2xl"
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white">{editing ? 'Editar banner' : 'Novo banner'}</h2>
                <button type="button" onClick={closeModal} className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white" aria-label="Fechar">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-white/75">Imagem *</span>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={form.imageUrl}
                      onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                      placeholder="https://..."
                      className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-400/60 focus:ring-2 focus:ring-orange-500/20"
                    />
                    <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm font-medium text-white/80 transition hover:bg-white/[0.10]">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload
                      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                  {form.imageUrl ? <img src={form.imageUrl} alt="Preview do banner" className="mt-2 aspect-[21/8] w-full rounded-xl object-cover" /> : null}
                </label>

                <TextField label="Titulo *" value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Ex: Black Friday - 50% off" />
                <TextField label="Subtitulo" value={form.subtitle} onChange={(value) => setForm({ ...form, subtitle: value })} placeholder="Descricao curta opcional" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Link" value={form.linkUrl} onChange={(value) => setForm({ ...form, linkUrl: value })} placeholder="/products" />
                  <TextField label="Texto do botao" value={form.linkLabel} onChange={(value) => setForm({ ...form, linkLabel: value })} placeholder="Ver promocao" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Inicio" type="datetime-local" value={form.startsAt} onChange={(value) => setForm({ ...form, startsAt: value })} />
                  <TextField label="Fim" type="datetime-local" value={form.endsAt} onChange={(value) => setForm({ ...form, endsAt: value })} />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div>
                    <p className="text-sm font-medium text-white">Publicar imediatamente</p>
                    <p className="mt-1 text-xs text-zinc-500">O agendamento ainda respeita as datas definidas.</p>
                  </div>
                  <Toggle checked={form.active} onChange={(active) => setForm({ ...form, active })} />
                </div>

                {error ? <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void saveBanner()}
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-wait disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? 'Salvando...' : editing ? 'Salvar alteracoes' : 'Criar banner'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteBanner ? (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101010] p-5 shadow-2xl" initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }}>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Excluir banner?</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">Essa acao remove {deleteBanner.title} da vitrine e nao pode ser desfeita.</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setDeleteId(null)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5">
                  Cancelar
                </button>
                <button type="button" onClick={() => void handleDelete()} className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400">
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
