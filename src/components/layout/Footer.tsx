import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-background-surface">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3 font-display text-2xl font-semibold text-text-primary">
            <Image src="/images/icons/favicon.png" alt="" width={38} height={38} className="rounded-full" />
            <span>CAFÉ Store</span>
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
            Produtos personalizados, lifestyle e tecnologia para quem vive o digital.
          </p>
          <div className="mt-4 flex gap-3">
            <Image src="/images/icons/Whatsapp.png" alt="WhatsApp" width={34} height={34} />
            <Image src="/images/icons/Telegram.png" alt="Telegram" width={34} height={34} />
            <Image src="/images/icons/Discord.png" alt="Discord" width={34} height={34} />
          </div>
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
