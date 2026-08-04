'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil, Power, Trash2 } from 'lucide-react';
import { deleteProductAction, toggleProductStatusAction } from '@/lib/admin/actions';
import { ActionGroup } from '@/components/admin/ui/ActionGroup';
import type { Action } from '@/components/admin/ui/ActionGroup';
import { Toast } from '@/components/ui/Toast';

type Props = {
  product: { id: string; slug: string; name: string; status: string };
};

export default function ProductActions({ product }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentStatus, setCurrentStatus] = useState(product.status);

  function removeRowWithAnimation() {
    const el = document.getElementById(`product-${product.id}`);
    if (!el) return;
    el.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(-8px)' }], {
      duration: 250,
      easing: 'ease',
    }).onfinish = () => el.remove();
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteProductAction(product.id);
      if (result.ok) {
        setConfirmOpen(false);
        removeRowWithAnimation();
      } else {
        setToast({ type: 'error', message: result.message });
      }
    });
  }

  function toggleStatus() {
    startTransition(async () => {
      const result = await toggleProductStatusAction(product.id);
      if (result.ok) setCurrentStatus((s) => (s === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'));
      setToast({ type: result.ok ? 'success' : 'error', message: result.message });
    });
  }

  const isActive = currentStatus === 'ACTIVE';

  const actions: Action[] = [
    {
      type: 'link',
      href: `/admin/produtos/${product.id}/editar`,
      label: 'Editar produto',
      icon: <Pencil className="h-3.5 w-3.5" />,
      variant: 'blue',
    },
    {
      type: 'link',
      href: `/admin/produtos/${product.id}`,
      label: 'Ver detalhes',
      icon: <ExternalLink className="h-3.5 w-3.5" />,
      variant: 'neutral',
    },
  ];

  const moreActions = [
    {
      type: 'dropdown-item' as const,
      label: isActive ? 'Desativar' : 'Ativar',
      icon: <Power className="h-3.5 w-3.5" />,
      variant: 'orange' as const,
      onClick: toggleStatus,
      loading,
    },
    {
      type: 'dropdown-item' as const,
      label: 'Excluir produto',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      variant: 'red' as const,
      onClick: () => setConfirmOpen(true),
    },
  ];

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ActionGroup actions={actions} moreActions={moreActions} size="sm" />

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setConfirmOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-red-500/20 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Excluir produto</h3>
                <p className="text-sm text-zinc-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-zinc-300">
              Tem certeza que deseja excluir{' '}
              <span className="font-semibold text-orange-400">&ldquo;{product.name}&rdquo;</span>?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="h-9 rounded-lg border border-white/10 px-4 text-sm text-zinc-300 transition hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={loading}
                className="flex h-9 items-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {loading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
