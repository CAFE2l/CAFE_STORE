'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Trash2, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ImageUploaderProps = {
  /** Current image URL (from DB or previous upload) */
  value?: string | null;
  /** Called with the new public URL after a successful upload */
  onChange: (url: string | null) => void;
  /** API endpoint that accepts multipart/form-data with a "file" field and returns { success, url } */
  uploadEndpoint: string;
  /** Optional DELETE endpoint — called with { url } when removing a locally-uploaded image */
  deleteEndpoint?: string;
  /** Aspect ratio class for the preview container, e.g. "aspect-square" or "aspect-video" */
  aspectRatio?: string;
  label?: string;
  hint?: string;
  maxSizeMb?: number;
  accept?: string;
  className?: string;
};

type UploadState = 'idle' | 'dragging' | 'uploading' | 'error';

export function ImageUploader({
  value,
  onChange,
  uploadEndpoint,
  deleteEndpoint,
  aspectRatio = 'aspect-video',
  label = 'Imagem',
  hint = 'PNG, JPG, WEBP • Máx. 5 MB',
  maxSizeMb = 5,
  accept = 'image/jpeg,image/png,image/webp',
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      const maxBytes = maxSizeMb * 1024 * 1024;

      if (!file.type.startsWith('image/')) {
        setError('Apenas imagens são aceitas.');
        return;
      }
      if (file.size > maxBytes) {
        setError(`Arquivo muito grande. Máximo ${maxSizeMb} MB.`);
        return;
      }

      setState('uploading');
      setProgress(0);

      // Simulate progress while uploading
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 12, 85));
      }, 120);

      try {
        const form = new FormData();
        form.append('file', file);

        const res = await fetch(uploadEndpoint, { method: 'POST', body: form });
        const json = await res.json().catch(() => ({}));

        clearInterval(interval);

        if (!res.ok || !json.success) {
          setError(json.error ?? 'Falha no upload. Tente novamente.');
          setState('error');
          return;
        }

        setProgress(100);
        onChange(json.url as string);
        setState('idle');
      } catch {
        clearInterval(interval);
        setError('Erro de rede. Tente novamente.');
        setState('error');
      }
    },
    [uploadEndpoint, maxSizeMb, onChange],
  );

  async function remove() {
    if (!value) return;
    // Only attempt server-side delete for locally uploaded files
    if (deleteEndpoint && value.startsWith('/uploads/')) {
      await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      }).catch(() => null);
    }
    onChange(null);
    setError(null);
    setState('idle');
    if (inputRef.current) inputRef.current.value = '';
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void upload(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setState('idle');
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setState('dragging');
  }

  function onDragLeave() {
    setState('idle');
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  const isUploading = state === 'uploading';

  return (
    <div className={cn('grid gap-2', className)}>
      {label && (
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</span>
      )}

      {value ? (
        /* ── Preview state ── */
        <div className={cn('group relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/40', aspectRatio)}>
          <Image
            src={value}
            alt="Preview"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/55 group-hover:opacity-100">
            <button
              type="button"
              aria-label="Trocar imagem"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-50"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Trocar
            </button>
            <button
              type="button"
              aria-label="Remover imagem"
              onClick={() => void remove()}
              disabled={isUploading}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-red-500/20 px-3 text-xs font-medium text-red-300 backdrop-blur-sm transition hover:bg-red-500/35 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remover
            </button>
          </div>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          role="button"
          tabIndex={0}
          aria-label={`${label} — clique ou arraste para fazer upload`}
          onClick={() => !isUploading && inputRef.current?.click()}
          onKeyDown={onKeyDown}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 select-none',
            aspectRatio,
            state === 'dragging'
              ? 'border-orange-400/70 bg-orange-500/10 scale-[1.01]'
              : state === 'error'
                ? 'border-red-400/50 bg-red-500/5'
                : 'border-white/[0.12] bg-white/[0.02] hover:border-orange-400/40 hover:bg-orange-500/5',
            isUploading && 'pointer-events-none',
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
              <p className="text-sm font-medium text-white">Enviando...</p>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-xl bg-white/10">
                <div
                  className="h-full bg-orange-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : state === 'dragging' ? (
            <>
              <UploadCloud className="h-8 w-8 text-orange-400" />
              <p className="text-sm font-semibold text-orange-300">Solte para fazer upload</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                <ImagePlus className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  <span className="text-orange-400">Clique para selecionar</span> ou arraste aqui
                </p>
                <p className="mt-1 text-xs text-zinc-500">{hint}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <span>{error}</span>
          <button
            type="button"
            aria-label="Fechar erro"
            onClick={() => { setError(null); setState('idle'); }}
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={onFileChange}
      />
    </div>
  );
}
