'use client';

import { useState, useTransition } from 'react';
import { Pencil, Eye, Trash2 } from 'lucide-react';
import { deleteProductAction, toggleProductStatusAction } from '@/lib/admin/actions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Props = {
  product: { id: string; slug: string; name: string; status: string };
};

export default function ProductActions({ product }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  }

  function handleEdit() {
    router.push(`/admin/produtos/${product.id}/edit`);
  }

  function handleView() {
    window.open(`/products/${product.slug}`, '_blank');
  }

  function handleDeleteConfirm() {
    setConfirmOpen(true);
  }

  function removeRowWithAnimation() {
    const el = document.getElementById(`product-${product.id}`);
    if (!el) return;
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease' }).onfinish = () => el.remove();
  }

  async function confirmDelete() {
    startTransition(async () => {
      try {
        const result = await deleteProductAction(product.id);
        if (result.ok) {
          showToast('success', 'Produto deletado com sucesso');
          setConfirmOpen(false);
          removeRowWithAnimation();
        } else {
          showToast('error', result.message || 'Erro ao deletar. Tente novamente.');
        }
      } catch (err) {
        showToast('error', 'Erro ao deletar. Tente novamente.');
      }
    });
  }

  async function toggleStatus() {
    startTransition(async () => {
      try {
        const result = await toggleProductStatusAction(product.id);
        showToast(result.ok ? 'success' : 'error', result.message);
      } catch (err) {
        showToast('error', 'Erro ao alterar status.');
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {toast ? (
        <div className={cn(
          'fixed right-5 top-20 z-[90] rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur',
          toast.type === 'success' ? 'border-emerald-400/20 bg-emerald-500/15 text-emerald-100' : 'border-red-400/20 bg-red-500/15 text-red-100',
        )}>
          {toast.message}
        </div>
      ) : null}

      <button
        type="button"
        title="Editar produto"
        aria-label="Editar produto"
        onClick={handleEdit}
        className="grid h-8 w-8 place-items-center rounded-md border border-white/8 bg-white/[0.06] text-zinc-300 transition hover:bg-[rgba(249,115,22,0.15)] hover:text-orange-400"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        type="button"
        title="Ver na loja"
        aria-label="Ver na loja"
        onClick={handleView}
        className="grid h-8 w-8 place-items-center rounded-md border border-white/8 bg-white/[0.06] text-zinc-300 transition hover:bg-white/10 hover:text-white"
      >
        <Eye className="h-4 w-4" />
      </button>

      <button
        type="button"
        title="Deletar produto"
        aria-label="Deletar produto"
        onClick={handleDeleteConfirm}
        className="grid h-8 w-8 place-items-center rounded-md border border-white/8 bg-[rgba(239,68,68,0.08)] text-[rgba(239,68,68,0.6)] transition hover:bg-[rgba(239,68,68,0.15)] hover:text-[#ef4444]"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <button
        type="button"
        title="Clique para ativar/desativar"
        aria-label="Alternar status"
        onClick={toggleStatus}
        className="h-9 rounded-lg border border-white/10 px-3 text-xs text-zinc-300 hover:bg-white/5"
      >
        Status
      </button>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[rgba(239,68,68,0.3)] bg-[#111111] p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[rgba(239,68,68,0.12)] p-3">
                <Trash2 className="h-6 w-6 text-[#ef4444]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Deletar produto</h3>
            </div>
            <p className="mt-4 text-sm text-zinc-300">Tem certeza que deseja deletar <span className="font-semibold text-orange-400">"{product.name}"</span>?</p>
            <p className="mt-2 text-sm text-red-400">Esta ação não pode ser desfeita. O produto será removido da loja.</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="h-10 rounded-lg border border-white/15 px-4 text-sm text-zinc-300 hover:border-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={loading as unknown as boolean}
                className="flex items-center gap-2 rounded-lg bg-[#ef4444] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:bg-[#dc2626] disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {loading ? 'Deletando...' : 'Sim, deletar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
