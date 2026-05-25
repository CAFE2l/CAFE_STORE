'use client';

import { MessageCircle } from 'lucide-react';

type Props = {
  href: string;
  label?: string;
};

export function WhatsAppButton({ href, label = 'Enviar pelo WhatsApp' }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-white shadow-led-brand transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_30px_8px_rgba(249,115,22,0.35)] active:scale-[0.98]"
    >
      <MessageCircle className="h-5 w-5" />
      {label}
    </a>
  );
}
