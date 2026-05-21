import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-background-surface">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link href="/" className="font-display text-2xl font-semibold text-text-primary">
            Cafe Store
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
            Cafe premium, acessorios e experiencias para quem leva preparo a serio.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Loja</h2>
          <div className="mt-3 grid gap-2 text-sm text-text-secondary">
            <Link href="/products" className="hover:text-text-primary">
              Produtos
            </Link>
            <Link href="/services" className="hover:text-text-primary">
              Servicos
            </Link>
            <Link href="/cart" className="hover:text-text-primary">
              Carrinho
            </Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Conta</h2>
          <div className="mt-3 grid gap-2 text-sm text-text-secondary">
            <Link href="/profile" className="hover:text-text-primary">
              Perfil
            </Link>
            <Link href="/orders" className="hover:text-text-primary">
              Pedidos
            </Link>
            <Link href="/login" className="hover:text-text-primary">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
