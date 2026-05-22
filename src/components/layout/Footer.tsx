import Link from 'next/link';
import { Flame, ShoppingBag, User, HelpCircle, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-cafe-dark-900">
      <div className="before:mx-auto before:block before:h-px before:w-full before:max-w-7xl before:bg-gradient-to-r before:from-transparent before:via-cafe-orange-500/30 before:to-transparent">
        <div className="container-page grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-text-primary">
              <Flame className="h-6 w-6 text-cafe-orange-500" />
              <span className="text-gradient-fire">CAFÉ Store</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-text-muted">
              Sua loja online de cafés especiais, equipamentos e acessórios para verdadeiros apreciadores de café.
            </p>
            <div className="mt-4 flex gap-3">
              {[
                { icon: 'instagram', label: 'Instagram' },
                { icon: 'facebook', label: 'Facebook' },
                { icon: 'twitter', label: 'Twitter' },
                { icon: 'whatsapp', label: 'WhatsApp' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="grid size-9 place-items-center rounded-button bg-cafe-dark-700 text-text-muted transition hover:bg-cafe-orange-500/20 hover:text-cafe-orange-500"
                  aria-label={social.label}
                >
                  <span className="text-xs font-bold">{social.icon.slice(0, 2).toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary">Loja</h3>
            <div className="mt-3 grid gap-2 text-sm text-text-muted">
              <Link href="/products" className="flex items-center gap-2 transition hover:text-cafe-orange-500">
                <ShoppingBag className="h-3.5 w-3.5" />
                Todos os produtos
              </Link>
              <Link href="/products?category=caespeciais" className="transition hover:text-cafe-orange-500">Cafés Especiais</Link>
              <Link href="/products?category=equipamentos" className="transition hover:text-cafe-orange-500">Equipamentos</Link>
              <Link href="/products?category=acessorios" className="transition hover:text-cafe-orange-500">Acessórios</Link>
              <Link href="/products?category=kits" className="transition hover:text-cafe-orange-500">Kits</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary">Conta</h3>
            <div className="mt-3 grid gap-2 text-sm text-text-muted">
              <Link href="/profile" className="flex items-center gap-2 transition hover:text-cafe-orange-500">
                <User className="h-3.5 w-3.5" />
                Meu perfil
              </Link>
              <Link href="/orders" className="transition hover:text-cafe-orange-500">Meus pedidos</Link>
              <Link href="/cart" className="transition hover:text-cafe-orange-500">Carrinho</Link>
              <Link href="/login" className="transition hover:text-cafe-orange-500">Entrar</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary">Ajuda</h3>
            <div className="mt-3 grid gap-2 text-sm text-text-muted">
              <Link href="/services" className="flex items-center gap-2 transition hover:text-cafe-orange-500">
                <HelpCircle className="h-3.5 w-3.5" />
                Atendimento
              </Link>
              <Link href="/services" className="transition hover:text-cafe-orange-500">Política de troca</Link>
              <Link href="/services" className="transition hover:text-cafe-orange-500">Frete e prazos</Link>
              <Link href="/services" className="transition hover:text-cafe-orange-500">FAQ</Link>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
              <Mail className="h-3.5 w-3.5 text-cafe-orange-500" />
              <a href="mailto:contato@cafestore.com.br" className="transition hover:text-cafe-orange-500">contato@cafestore.com.br</a>
            </div>
          </div>
        </div>

        <div className="border-t border-border-subtle">
          <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs text-text-muted sm:flex-row">
            <p>&copy; {new Date().getFullYear()} CAFÉ Store. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <Link href="/services" className="transition hover:text-cafe-orange-500">Política de privacidade</Link>
              <Link href="/services" className="transition hover:text-cafe-orange-500">Termos de uso</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
