import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

type FilterOption = { label: string; value: string };

type AdminFiltersProps = {
  q?: string;
  status?: string;
  statusLabel?: string;
  options?: FilterOption[];
  action?: string;
};

export function AdminFilters({ q = '', status = 'all', statusLabel = 'Status', options = [], action }: AdminFiltersProps) {
  return (
    <form action={action} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/25 p-3 backdrop-blur md:flex-row">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, email, slug ou ID"
          className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white outline-none transition focus:border-orange-400/60"
        />
      </label>
      {options.length ? (
        <select
          name="status"
          defaultValue={status}
          aria-label={statusLabel}
          className="h-11 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-orange-400/60"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
      <button className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white shadow-led-brand transition hover:bg-orange-400">
        Filtrar
      </button>
    </form>
  );
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25 shadow-card backdrop-blur">{children}</div>;
}

export function Pagination({ page, pageSize, total, basePath }: { page: number; pageSize: number; total: number; basePath: string }) {
  const lastPage = Math.max(Math.ceil(total / pageSize), 1);
  const previous = page > 1 ? `${basePath}${basePath.includes('?') ? '&' : '?'}page=${page - 1}` : null;
  const next = page < lastPage ? `${basePath}${basePath.includes('?') ? '&' : '?'}page=${page + 1}` : null;

  return (
    <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm text-zinc-400">
      <span>
        Página {page} de {lastPage} • {total} registros
      </span>
      <div className="flex gap-2">
        {previous ? (
          <Link href={previous} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 hover:bg-white/5">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : null}
        {next ? (
          <Link href={next} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 hover:bg-white/5">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="max-w-sm">
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

