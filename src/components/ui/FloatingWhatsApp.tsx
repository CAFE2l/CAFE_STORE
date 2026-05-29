'use client';

import { cn } from '@/lib/utils';
import { WhatsappIcon } from '@/components/ui/WhatsappIcon';

type FloatingWhatsAppProps = {
  productName?: string;
};

const WHATSAPP_NUMBER = '5541996713782';

export function FloatingWhatsApp({ productName }: FloatingWhatsAppProps) {
  const message = productName
    ? `Olá! Tenho dúvidas sobre o apoio simbólico: ${productName}`
    : 'Olá! Tenho interesse nos serviços digitais da CAFÉ!';

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'fixed bottom-24 right-6 z-40 flex size-14 items-center justify-center',
        'rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)]',
        'transition-all duration-300 hover:scale-110 hover:shadow-[0_4px_28px_rgba(37,211,102,0.6)]',
        'animate-float',
      )}
      aria-label="Fale conosco no WhatsApp"
    >
      <WhatsappIcon className="h-7 w-7" />
    </a>
  );
}
