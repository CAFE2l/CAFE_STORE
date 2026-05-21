import Link from 'next/link';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Produtos' },
  { href: '/admin/orders', label: 'Pedidos' },
  { href: '/admin/users', label: 'Usuarios' },
  { href: '/admin/categories', label: 'Categorias' },
  { href: '/admin/reviews', label: 'Avaliacoes' },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-border-subtle bg-background-surface p-5 lg:block">
      <Link href="/admin/dashboard" className="font-display text-2xl font-semibold text-text-primary">
        Cafe Admin
      </Link>
      <nav className="mt-8 grid gap-2" aria-label="Navegacao administrativa">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition hover:bg-background-card hover:text-text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link href="/" className="mt-8 inline-flex text-sm text-accent-primary hover:text-accent-glow">
        Voltar para loja
      </Link>
    </aside>
  );
}
