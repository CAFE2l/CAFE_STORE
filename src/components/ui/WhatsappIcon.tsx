import Image from 'next/image';

type Props = {
  className?: string;
  alt?: string;
};

export function WhatsappIcon({ className = 'h-5 w-5', alt = 'WhatsApp' }: Props) {
  return (
    <Image
      src="/images/icons/Whatsapp.png"
      alt={alt}
      width={24}
      height={24}
      className={className}
    />
  );
}
