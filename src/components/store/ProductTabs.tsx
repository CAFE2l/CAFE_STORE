'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

type ProductTabsProps = {
  category?: string;
  description: string | null;
  productName?: string;
  reviews?: {
    id: string;
    rating: number;
    comment: string | null;
    images: string[];
    videoUrl: string | null;
    verifiedPurchase: boolean;
    createdAt: Date;
    user: {
      name: string | null;
      image: string | null;
    };
  }[];
  productId?: string;
};

type Question = {
  id: string;
  authorName: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
};

const tabs = [
  { id: 'descricao', label: 'Descrição' },
  { id: 'especificacoes', label: 'Especificações' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'perguntas', label: 'Perguntas' },
] as const;

type TabId = (typeof tabs)[number]['id'];

function getDefaultSpecs(category?: string) {
  if (category === 'Camisetas') {
    return {
      material: 'Malha premium 100% algodão 30.1',
      gramatura: '180g/m²',
      corte: 'Regular fit — modelagem confortável',
      disponivel: 'P, M, G, GG, XGG',
      origem: 'Brasil',
      cuidados: 'Lavar do avesso, não usar alvejante, secar à sombra',
    };
  }
  if (category === 'Canecas') {
    return {
      material: 'Cerâmica brilhante de alta resistência',
      capacidade: '325ml',
      acabamento: 'Impressão digital resistente a lava-louças',
      origem: 'Brasil',
      cuidados: 'Evite impactos, lave com esponja macia',
    };
  }
  if (category === 'Moletons') {
    return {
      material: 'Moletom encorpado 80% algodão 20% poliéster',
      gramatura: '320g/m²',
      corte: 'Casual — modelagem tradicional',
      disponivel: 'P, M, G, GG',
      origem: 'Brasil',
      cuidados: 'Lavar do avesso em ciclo suave, não passar na estampa',
    };
  }
  return {
    material: 'Produto oficial CAFÉ STORE com acabamento premium',
    origem: 'Brasil',
    cuidados: 'Manuseie com cuidado, siga as instruções internas',
  };
}

export function ProductTabs({ category, description, productName, reviews = [], productId }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('descricao');
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | 'all'>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [questionSuccess, setQuestionSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [reviewImageFiles, setReviewImageFiles] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [reviewVideoFile, setReviewVideoFile] = useState<{ id: string; file: File; preview: string } | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [lightbox, setLightbox] = useState<{ type: 'image' | 'video'; src: string } | null>(null);
  const specs = getDefaultSpecs(category);
  const maxReviewImages = 4;

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((session) => setIsAuthenticated(Boolean(session?.user?.id)))
      .catch(() => setIsAuthenticated(false));
  }, []);

  useEffect(() => {
    return () => {
      reviewImageFiles.forEach((item) => URL.revokeObjectURL(item.preview));
      if (reviewVideoFile) URL.revokeObjectURL(reviewVideoFile.preview);
    };
  }, [reviewImageFiles, reviewVideoFile]);

  const filteredReviews = reviewFilter === 'all'
    ? reviews
    : reviews.filter((r) => r.rating === reviewFilter);

  const ratingBreakdown = [0, 0, 0, 0, 0];
  reviews.forEach((r) => { ratingBreakdown[r.rating - 1]++; });
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  useEffect(() => {
    if (activeTab !== 'perguntas' || !productId || questions.length > 0) return;
    setQuestionsLoading(true);
    fetch(`/api/products/${productId}/questions`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setQuestions(res.data);
      })
      .catch(() => {})
      .finally(() => setQuestionsLoading(false));
  }, [activeTab, productId, questions.length]);

  const handleAskQuestion = useCallback(async () => {
    if (!newQuestion.trim() || !productId) return;
    setSubmittingQuestion(true);
    setQuestionError(null);
    setQuestionSuccess(false);
    try {
      const res = await fetch(`/api/products/${productId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setQuestions((prev) => [json.data, ...prev]);
        setNewQuestion('');
        setQuestionSuccess(true);
        setTimeout(() => setQuestionSuccess(false), 3000);
      } else {
        setQuestionError(json.error ?? 'Erro ao enviar pergunta.');
      }
    } catch {
      setQuestionError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmittingQuestion(false);
    }
  }, [newQuestion, productId]);

  const handleAddReviewImages = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = maxReviewImages - reviewImageFiles.length;
    const picked = Array.from(files).filter((file) => file.type.startsWith('image/')).slice(0, remaining);
    if (picked.length === 0) return;
    setReviewImageFiles((prev) => [
      ...prev,
      ...picked.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  }, [reviewImageFiles.length]);

  const handleRemoveReviewImage = useCallback((id: string) => {
    setReviewImageFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const handleAddReviewVideo = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith('video/')) return;
    setReviewVideoFile((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return { id: `${Date.now()}`, file, preview: URL.createObjectURL(file) };
    });
  }, []);

  const handleRemoveReviewVideo = useCallback(() => {
    setReviewVideoFile((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return null;
    });
  }, []);

  async function uploadReviewMedia() {
    const files: File[] = [...reviewImageFiles.map((item) => item.file)];
    if (reviewVideoFile) files.push(reviewVideoFile.file);
    if (files.length === 0) return { images: [] as string[], videoUrl: null as string | null };

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await fetch('/api/upload/media', { method: 'POST', body: formData });
    const json = (await response.json()) as { success: boolean; urls?: string[]; error?: string };

    if (!response.ok || !json.success || !json.urls) {
      throw new Error(json.error ?? 'Erro ao enviar arquivos.');
    }

    const images: string[] = [];
    let videoUrl: string | null = null;
    if (reviewVideoFile) {
      videoUrl = json.urls[json.urls.length - 1] ?? null;
      json.urls.slice(0, -1).forEach((url) => images.push(url));
    } else {
      images.push(...json.urls);
    }

    return { images, videoUrl };
  }

  async function handleSubmitReview() {
    if (!productId) return;
    if (newRating < 1) {
      setReviewError('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    if (!newReview.trim()) {
      setReviewError('Escreva um comentario.');
      return;
    }

    setReviewSaving(true);
    setReviewError(null);
    setReviewSuccess(false);

    try {
      const media = await uploadReviewMedia();
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: newRating,
          comment: newReview.trim(),
          images: media.images,
          videoUrl: media.videoUrl,
        }),
      });
      const json = (await response.json()) as { success: boolean; data?: { id: string; rating: number; comment: string | null; images?: string[]; videoUrl?: string | null }; error?: string };

      if (response.status === 401) {
        setIsAuthenticated(false);
        setReviewError('Entre na sua conta para enviar uma avaliacao.');
        return;
      }

      if (!response.ok || !json.success) {
        setReviewError(json.error ?? 'Erro ao enviar avaliacao.');
        return;
      }

      setReviewSuccess(true);
      setNewRating(0);
      setNewReview('');
      reviewImageFiles.forEach((item) => URL.revokeObjectURL(item.preview));
      setReviewImageFiles([]);
      if (reviewVideoFile) URL.revokeObjectURL(reviewVideoFile.preview);
      setReviewVideoFile(null);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Erro ao enviar avaliacao.');
    } finally {
      setReviewSaving(false);
    }
  }

  return (
    <section className="mx-auto mt-14 max-w-7xl px-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800 overflow-x-auto scrollbar-none" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={cn(
              'whitespace-nowrap px-5 py-3.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-brand text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300',
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'avaliacoes' && reviews.length > 0 ? (
              <span className="ml-1.5 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-500">{reviews.length}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6 animate-fadeIn min-h-[200px]">
        {/* Descricao */}
        {activeTab === 'descricao' ? (
          <div className="max-w-3xl">
            <div className={cn(
              'relative text-sm leading-7 text-zinc-400',
              !expandedDesc && 'max-h-[320px] overflow-hidden',
            )}>
              <p>{description ?? `${productName ?? 'Apoio CAFÉ STORE'} simbólico para apoiar o projeto.`}</p>
              <p className="mt-4">
                As imagens são demonstrativas e ajudam a visualizar a identidade da marca, mas este item não é
                vendido como produto físico. O valor representa uma doação voluntária ao projeto CAFÉ STORE.
              </p>
              <ul className="mt-4 grid gap-2">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-brand">✓</span> Design exclusivo CAFÉ STORE</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-brand">✓</span> Apoio simbólico ao projeto</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-brand">✓</span> Imagens ilustrativas</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-brand">✓</span> Sem envio de produto físico</li>
              </ul>
              {!expandedDesc ? (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-900/50 to-transparent" />
              ) : null}
            </div>
            <button
              type="button"
              className="mt-3 text-sm font-medium text-brand transition hover:text-brand-light"
              onClick={() => setExpandedDesc(!expandedDesc)}
            >
              {expandedDesc ? 'Ver menos ↑' : 'Ler mais ↓'}
            </button>
          </div>
        ) : null}

        {/* Especificacoes */}
        {activeTab === 'especificacoes' ? (
          <div className="max-w-2xl">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(specs).map(([key, value], i) => (
                  <tr key={key} className={cn(i % 2 === 0 && 'bg-zinc-900/30')}>
                    <td className="w-1/3 px-4 py-3 capitalize text-zinc-500">{key}</td>
                    <td className="px-4 py-3 text-white">{value}</td>
                  </tr>
                ))}
                <tr className="bg-zinc-900/30">
                  <td className="px-4 py-3 capitalize text-zinc-500">código</td>
                  <td className="px-4 py-3 text-white font-mono text-xs">CAF-{productName?.slice(0, 3).toUpperCase() ?? 'XXX'}-001</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Avaliacoes */}
        {activeTab === 'avaliacoes' ? (
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Summary */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
              <p className="text-5xl font-black text-white">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</p>
              <div className="mt-2 flex justify-center gap-0.5 text-lg text-[#FFD000]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={cn(i < Math.round(avgRating) ? 'opacity-100' : 'opacity-30')}>★</span>
                ))}
              </div>
              <p className="mt-1 text-sm text-zinc-500">{reviews.length} avaliaç{reviews.length !== 1 ? 'ões' : 'ão'}</p>

              <div className="mt-6 grid gap-1.5 text-left text-xs">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingBreakdown[star - 1];
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="w-6 text-right text-zinc-500">{star}★</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                        <div className="h-full rounded-full bg-[#FFD000] transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-5 text-right text-zinc-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews list */}
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { value: 'all' as const, label: 'Todas' },
                  { value: 5 as const, label: '★5' },
                  { value: 4 as const, label: '★4' },
                  { value: 3 as const, label: '★3' },
                  { value: 2 as const, label: '★2' },
                  { value: 1 as const, label: '★1' },
                ].map((f) => (
                  <button
                    key={String(f.value)}
                    type="button"
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                      reviewFilter === f.value
                        ? 'bg-brand/15 text-brand ring-1 ring-brand/30'
                        : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300',
                    )}
                    onClick={() => setReviewFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredReviews.length > 0 ? (
                <div className="grid gap-4">
                  {filteredReviews.map((review) => (
                    <article key={review.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {review.user.image ? (
                            <span className="relative block size-9 overflow-hidden rounded-full">
                              <Image src={review.user.image} alt={review.user.name ?? 'C'} fill sizes="36px" className="object-cover" />
                            </span>
                          ) : (
                            <span className="grid size-9 place-items-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                              {(review.user.name ?? 'C').slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">{review.user.name ?? 'Cliente'}</p>
                            <p className="text-xs text-zinc-500">
                              {review.verifiedPurchase ? '✓ Apoio verificado' : 'Avaliação'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-sm text-[#FFD000]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={cn(i < review.rating ? 'opacity-100' : 'opacity-30')}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">{review.comment ?? 'Apoio avaliado pelo cliente.'}</p>

                      {(review.images?.length ?? 0) > 0 || review.videoUrl ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {review.images.map((src) => (
                            <button
                              type="button"
                              key={src}
                              onClick={() => setLightbox({ type: 'image', src })}
                              className="group relative overflow-hidden rounded-lg border border-zinc-700/50 transition hover:border-brand/40"
                            >
                              <Image
                                src={src}
                                alt="Foto enviada pelo cliente"
                                width={112}
                                height={112}
                                sizes="112px"
                                className="size-28 object-cover transition duration-200 group-hover:scale-105"
                              />
                            </button>
                          ))}
                          {review.videoUrl ? (
                            <button
                              type="button"
                              onClick={() => setLightbox({ type: 'video', src: review.videoUrl! })}
                              className="group relative grid size-28 place-items-center overflow-hidden rounded-lg border border-zinc-700/50 bg-zinc-800 transition hover:border-brand/40"
                              aria-label="Ver video da avaliacao"
                            >
                              <video preload="metadata" src={review.videoUrl} className="absolute inset-0 size-full object-cover opacity-60" muted playsInline />
                              <span className="relative grid size-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition group-hover:bg-brand">
                                <svg className="ml-0.5 size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72L19 12 8 5.14z" /></svg>
                              </span>
                            </button>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-600">
                        <button type="button" className="transition hover:text-zinc-400">👍 Útil ({Math.floor(Math.random() * 15)})</button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center text-sm text-zinc-500">
                  {reviews.length === 0
                    ? 'Este apoio ainda não recebeu avaliações. Seja o primeiro!'
                    : 'Nenhuma avaliação com esse filtro.'}
                </div>
              )}

              {/* Review form */}
              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                {isAuthenticated === null ? (
                  <div className="flex h-24 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <h4 className="text-sm font-semibold text-white">Deixe sua avaliação</h4>
                    <p className="mt-1 text-xs text-zinc-500">Conte como foi sua experiência e envie fotos ou vídeo do produto.</p>

                    <div className="mt-3">
                      <p className="text-xs font-medium text-zinc-500">Sua nota</p>
                      <div className="mt-1.5 flex items-center gap-1 text-2xl">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            aria-label={`${i + 1} estrela${i + 1 > 1 ? 's' : ''}`}
                            className={cn(
                              'transition',
                              i < newRating ? 'text-[#FFD000]' : 'text-zinc-700 hover:text-[#FFD000]',
                            )}
                            onClick={() => setNewRating(i + 1)}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-sm text-white placeholder:text-zinc-600 resize-none transition-colors focus:border-brand/40 focus:outline-none"
                      rows={3}
                      placeholder="Escreva seu comentário..."
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      disabled={reviewSaving}
                    />

                    <div className="mt-3 grid gap-3">
                      <div>
                        <p className="text-xs font-medium text-zinc-500">
                          Fotos do produto {reviewImageFiles.length > 0 && <span className="text-zinc-600">({reviewImageFiles.length}/{maxReviewImages})</span>}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {reviewImageFiles.map((item) => (
                            <div key={item.id} className="relative">
                              <Image
                                src={item.preview}
                                alt="Prévia da foto"
                                width={72}
                                height={72}
                                unoptimized
                                className="size-[72px] rounded-lg border border-zinc-700 object-cover"
                              />
                              <button
                                type="button"
                                aria-label="Remover foto"
                                className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] text-white transition hover:bg-red-400"
                                onClick={() => handleRemoveReviewImage(item.id)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          {reviewImageFiles.length < maxReviewImages ? (
                            <label className="grid h-[72px] w-[72px] cursor-pointer place-items-center rounded-lg border border-dashed border-zinc-600 text-zinc-500 transition hover:border-brand/50 hover:text-brand">
                              <span className="text-2xl leading-none">+</span>
                              <input
                                className="sr-only"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                multiple
                                disabled={reviewSaving}
                                onChange={(event) => {
                                  handleAddReviewImages(event.target.files);
                                  event.currentTarget.value = '';
                                }}
                              />
                            </label>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-zinc-500">Vídeo (opcional)</p>
                        <div className="mt-1.5">
                          {reviewVideoFile ? (
                            <div className="relative w-fit">
                              <video src={reviewVideoFile.preview} className="h-28 w-40 rounded-lg border border-zinc-700 object-cover" controls muted playsInline />
                              <button
                                type="button"
                                aria-label="Remover vídeo"
                                className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] text-white transition hover:bg-red-400"
                                onClick={handleRemoveReviewVideo}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-600 px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-brand/50 hover:text-brand">
                              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="14" height="12" rx="2" ry="2" /><path d="M22 8l-6 4 6 4V8z" /></svg>
                              Enviar vídeo
                              <input
                                className="sr-only"
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                disabled={reviewSaving}
                                onChange={(event) => {
                                  handleAddReviewVideo(event.target.files?.[0]);
                                  event.currentTarget.value = '';
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    {reviewError ? <p className="mt-3 text-xs text-status-error">{reviewError}</p> : null}
                    {reviewSuccess ? <p className="mt-3 text-xs text-emerald-400">Avaliação enviada com sucesso!</p> : null}

                    <Button
                      type="button"
                      size="sm"
                      className="mt-4"
                      disabled={reviewSaving || newRating < 1}
                      loading={reviewSaving}
                      onClick={handleSubmitReview}
                    >
                      Publicar Avaliação
                    </Button>
                  </>
                ) : (
                  <>
                    <h4 className="text-sm font-semibold text-white">Deixe sua avaliação</h4>
                    <p className="mt-1 text-xs text-zinc-500">Entre na sua conta para avaliar este apoio e enviar fotos ou vídeo do produto.</p>
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : `/products/${productId}`)}`}
                      className="mt-4 inline-flex h-9 items-center rounded-lg bg-brand px-4 text-xs font-semibold text-white transition hover:brightness-110"
                    >
                      Fazer login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Perguntas */}
        {activeTab === 'perguntas' ? (
          <div className="max-w-3xl space-y-6">
            {/* Ask form */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <h4 className="text-sm font-semibold text-white">Tem dúvidas sobre este apoio?</h4>
              <p className="mt-1 text-xs text-zinc-500">Pergunte publicamente — a loja ou outro cliente pode responder.</p>
              <textarea
                className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-sm text-white placeholder:text-zinc-600 resize-none transition-colors focus:border-brand/40 focus:outline-none"
                rows={3}
                placeholder="Escreva sua pergunta..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                disabled={submittingQuestion}
              />
              <div className="mt-3 flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAskQuestion}
                  loading={submittingQuestion}
                  disabled={!newQuestion.trim()}
                >
                  Enviar Pergunta
                </Button>
                {questionSuccess && (
                  <span className="text-xs text-emerald-400">Pergunta enviada com sucesso!</span>
                )}
                {questionError && (
                  <span className="text-xs text-status-error">{questionError}</span>
                )}
              </div>
            </div>

            {/* Questions list */}
            {questionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              </div>
            ) : questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((q) => (
                  <article key={q.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                          {q.authorName.slice(0, 1).toUpperCase()}
                        </span>
                        <p className="text-sm font-medium text-white">{q.authorName}</p>
                      </div>
                      <time className="text-xs text-zinc-600">
                        {new Date(q.createdAt).toLocaleDateString('pt-BR')}
                      </time>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">{q.question}</p>
                    {q.answer && (
                      <div className="mt-4 rounded-lg border border-brand/15 bg-brand/5 p-4">
                        <div className="flex items-center gap-2">
                          <span className="grid size-6 place-items-center rounded-full bg-brand/20 text-[10px] font-bold text-brand">R</span>
                          <span className="text-xs font-semibold text-brand">Resposta da loja</span>
                          {q.answeredAt && (
                            <time className="text-xs text-zinc-600">
                              {new Date(q.answeredAt).toLocaleDateString('pt-BR')}
                            </time>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{q.answer}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center text-sm text-zinc-500">
                Nenhuma pergunta ainda. Seja o primeiro a perguntar!
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Media lightbox */}
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
              alt="Foto enviada pelo cliente"
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
