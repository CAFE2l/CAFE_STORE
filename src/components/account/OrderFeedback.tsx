'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

type FeedbackItem = {
  id: string;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number;
  body: string;
  images: string[];
  videoUrl: string | null;
  createdAt: string;
};

type OrderFeedbackProps = {
  orderId: string;
};

const maxImages = 4;

export function OrderFeedback({ orderId }: OrderFeedbackProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [imageFiles, setImageFiles] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [videoFile, setVideoFile] = useState<{ id: string; file: File; preview: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lightbox, setLightbox] = useState<{ type: 'image' | 'video'; src: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((session) => setIsAuthenticated(Boolean(session?.user?.id)))
      .catch(() => setIsAuthenticated(false));

    fetch(`/api/orders/${orderId}/feedback`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setFeedbacks(res.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    return () => {
      imageFiles.forEach((item) => URL.revokeObjectURL(item.preview));
      if (videoFile) URL.revokeObjectURL(videoFile.preview);
    };
  }, [imageFiles, videoFile]);

  const myFeedback = feedbacks[0];

  const handleAddImages = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = maxImages - imageFiles.length;
    const picked = Array.from(files).filter((file) => file.type.startsWith('image/')).slice(0, remaining);
    if (picked.length === 0) return;
    setImageFiles((prev) => [
      ...prev,
      ...picked.map((file) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file, preview: URL.createObjectURL(file) })),
    ]);
  }, [imageFiles.length]);

  const handleRemoveImage = useCallback((id: string) => {
    setImageFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const handleAddVideo = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith('video/')) return;
    setVideoFile((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return { id: `${Date.now()}`, file, preview: URL.createObjectURL(file) };
    });
  }, []);

  async function handleSubmit() {
    if (rating < 1) {
      setError('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    if (!body.trim()) {
      setError('Escreva seu feedback.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const files: File[] = [...imageFiles.map((item) => item.file)];
      if (videoFile) files.push(videoFile.file);

      let images: string[] = [];
      let videoUrl: string | null = null;

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        const uploadRes = await fetch('/api/upload/media', { method: 'POST', body: formData });
        const uploadJson = (await uploadRes.json()) as { success: boolean; urls?: string[]; error?: string };
        if (!uploadRes.ok || !uploadJson.success || !uploadJson.urls) {
          throw new Error(uploadJson.error ?? 'Erro ao enviar arquivos.');
        }
        if (videoFile) {
          videoUrl = uploadJson.urls[uploadJson.urls.length - 1] ?? null;
          images = uploadJson.urls.slice(0, -1);
        } else {
          images = uploadJson.urls;
        }
      }

      const res = await fetch(`/api/orders/${orderId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, body: body.trim(), images, videoUrl }),
      });
      const json = (await res.json()) as { success: boolean; data?: FeedbackItem; error?: string };

      if (res.status === 401) {
        setIsAuthenticated(false);
        setError('Entre na sua conta para enviar feedback.');
        return;
      }

      if (!res.ok || !json.success || !json.data) {
        setError(json.error ?? 'Erro ao enviar feedback.');
        return;
      }

      setFeedbacks((prev) => [json.data!, ...prev]);
      setRating(0);
      setBody('');
      imageFiles.forEach((item) => URL.revokeObjectURL(item.preview));
      setImageFiles([]);
      if (videoFile) URL.revokeObjectURL(videoFile.preview);
      setVideoFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar feedback.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-text-primary">Feedback do pedido</h2>
      </div>
      <p className="mt-2 text-sm text-text-muted">
        Comprovou a entrega? Envie fotos ou um vídeo do produto e conte como foi a experiência.
      </p>

      {loading ? (
        <div className="mt-6 flex h-24 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {feedbacks.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {feedbacks.map((feedback) => (
                <article key={feedback.id} className="rounded-xl border border-border-subtle bg-background-surface/60 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {feedback.authorAvatarUrl ? (
                        <Image
                          src={feedback.authorAvatarUrl}
                          alt={feedback.authorName}
                          width={36}
                          height={36}
                          className="size-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid size-9 place-items-center rounded-full bg-accent-primary/15 text-sm font-semibold text-accent-primary">
                          {feedback.authorName.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{feedback.authorName}</p>
                        <p className="text-xs text-text-muted">
                          {new Date(feedback.createdAt).toLocaleDateString('pt-BR')}
                          {feedbacks[0]?.id === feedback.id ? ' · Enviado por você' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-sm text-[#FFD000]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={cn(i < feedback.rating ? 'opacity-100' : 'opacity-30')}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{feedback.body}</p>

                  {feedback.images.length > 0 || feedback.videoUrl ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {feedback.images.map((src) => (
                        <button
                          type="button"
                          key={src}
                          onClick={() => setLightbox({ type: 'image', src })}
                          className="group relative overflow-hidden rounded-lg border border-border-subtle transition hover:border-accent-primary/50"
                        >
                          <Image
                            src={src}
                            alt="Foto enviada"
                            width={112}
                            height={112}
                            sizes="112px"
                            className="size-28 object-cover transition duration-200 group-hover:scale-105"
                          />
                        </button>
                      ))}
                      {feedback.videoUrl ? (
                        <button
                          type="button"
                          onClick={() => setLightbox({ type: 'video', src: feedback.videoUrl! })}
                          className="group relative grid size-28 place-items-center overflow-hidden rounded-lg border border-border-subtle bg-background-surface transition hover:border-accent-primary/50"
                          aria-label="Ver vídeo do feedback"
                        >
                          <video preload="metadata" src={feedback.videoUrl} className="absolute inset-0 size-full object-cover opacity-60" muted playsInline />
                          <span className="relative grid size-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition group-hover:bg-accent-primary">
                            <svg className="ml-0.5 size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72L19 12 8 5.14z" /></svg>
                          </span>
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {isAuthenticated === null ? null : isAuthenticated ? (
            myFeedback ? (
              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-400">
                Feedback enviado com sucesso! Obrigado por confirmar a entrega.
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-border-subtle bg-background-surface/60 p-5">
                <div>
                  <p className="text-xs font-medium text-text-muted">Sua nota</p>
                  <div className="mt-1.5 flex items-center gap-1 text-2xl">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`${i + 1} estrela${i + 1 > 1 ? 's' : ''}`}
                        className={cn('transition', i < rating ? 'text-[#FFD000]' : 'text-zinc-700 hover:text-[#FFD000]')}
                        onClick={() => setRating(i + 1)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  className="mt-3 w-full rounded-lg border border-border-subtle bg-background-surface p-3 text-sm text-text-primary placeholder:text-text-muted resize-none transition-colors focus:border-accent-primary/50 focus:outline-none"
                  rows={3}
                  placeholder="Conte como foi o recebimento do produto..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={saving}
                />

                <div className="mt-3 grid gap-3">
                  <div>
                    <p className="text-xs font-medium text-text-muted">
                      Fotos {imageFiles.length > 0 && <span className="text-text-muted/70">({imageFiles.length}/{maxImages})</span>}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {imageFiles.map((item) => (
                        <div key={item.id} className="relative">
                          <Image
                            src={item.preview}
                            alt="Prévia da foto"
                            width={72}
                            height={72}
                            unoptimized
                            className="size-[72px] rounded-lg border border-border-subtle object-cover"
                          />
                          <button
                            type="button"
                            aria-label="Remover foto"
                            className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] text-white transition hover:bg-red-400"
                            onClick={() => handleRemoveImage(item.id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {imageFiles.length < maxImages ? (
                        <label className="grid h-[72px] w-[72px] cursor-pointer place-items-center rounded-lg border border-dashed border-border-subtle text-text-muted transition hover:border-accent-primary/50 hover:text-accent-primary">
                          <span className="text-2xl leading-none">+</span>
                          <input
                            className="sr-only"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            disabled={saving}
                            onChange={(event) => {
                              handleAddImages(event.target.files);
                              event.currentTarget.value = '';
                            }}
                          />
                        </label>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-text-muted">Vídeo (opcional)</p>
                    <div className="mt-1.5">
                      {videoFile ? (
                        <div className="relative w-fit">
                          <video src={videoFile.preview} className="h-28 w-40 rounded-lg border border-border-subtle object-cover" controls muted playsInline />
                          <button
                            type="button"
                            aria-label="Remover vídeo"
                            className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] text-white transition hover:bg-red-400"
                            onClick={() => setVideoFile(null)}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border-subtle px-4 py-2.5 text-xs font-medium text-text-muted transition hover:border-accent-primary/50 hover:text-accent-primary">
                          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="14" height="12" rx="2" ry="2" /><path d="M22 8l-6 4 6 4V8z" /></svg>
                          Enviar vídeo
                          <input
                            className="sr-only"
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            disabled={saving}
                            onChange={(event) => {
                              handleAddVideo(event.target.files?.[0]);
                              event.currentTarget.value = '';
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {error ? <p className="mt-3 text-xs text-status-error">{error}</p> : null}
                {success ? <p className="mt-3 text-xs text-emerald-400">Feedback enviado com sucesso!</p> : null}

                <Button type="button" size="md" className="mt-4" disabled={saving || rating < 1} loading={saving} onClick={handleSubmit}>
                  Enviar feedback
                </Button>
              </div>
            )
          ) : (
            <div className="mt-5 rounded-xl border border-border-subtle bg-background-surface/60 p-5">
              <p className="text-sm text-text-secondary">Entre na sua conta para enviar fotos ou vídeo do produto recebido.</p>
              <Link href={`/login?callbackUrl=${encodeURIComponent(`/orders/${orderId}`)}`} className="mt-3 inline-flex h-10 items-center rounded-xl bg-accent-primary px-5 text-sm font-semibold text-white transition hover:brightness-110">
                Fazer login
              </Link>
            </div>
          )}
        </>
      )}

      {lightbox ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar mídia"
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          {lightbox.type === 'image' ? (
            <Image
              src={lightbox.src}
              alt="Foto enviada"
              width={1200}
              height={900}
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video
              src={lightbox.src}
              controls
              autoPlay
              playsInline
              className="max-h-[85vh] w-auto max-w-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
