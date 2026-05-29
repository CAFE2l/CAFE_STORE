'use client';

import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type SaveButtonProps = {
  status: SaveStatus;
  onClick: () => void;
  className?: string;
};

export function SaveButton({ status, onClick, className }: SaveButtonProps) {
  return (
    <div className="flex items-center gap-3">
      {status === 'saved' && (
        <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400 animate-fade-in">
          <Check className="h-4 w-4" />
          Salvo com sucesso
        </span>
      )}
      {status === 'error' && (
        <span className="flex items-center gap-1.5 text-sm font-medium text-red-400 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          Erro ao salvar
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={status === 'saving'}
        className={cn(
          'flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-semibold transition-all duration-200',
          'bg-orange-500 text-white hover:bg-orange-400 active:scale-[0.97]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        {status === 'saving' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar alterações'
        )}
      </button>
    </div>
  );
}
