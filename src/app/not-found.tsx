import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      <Image
        src="/images/404.png"
        alt="Página não encontrada"
        fill
        className="object-cover opacity-60"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      <div className="relative z-10 px-4 text-center">
        <Link
          href="/"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-8 text-sm font-bold text-white shadow-[0_0_25px_rgba(249,115,22,0.35)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:brightness-110 active:scale-95"
        >
          ← Voltar ao inicio
        </Link>
      </div>
    </div>
  );
}
