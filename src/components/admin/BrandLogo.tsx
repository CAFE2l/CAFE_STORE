import Image from 'next/image';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  size?: number;
  className?: string;
};

export function BrandLogo({ size = 40, className }: BrandLogoProps) {
  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400 p-[2px] shadow-led-brand',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/favicon.png"
        alt="CAFÉ STORE"
        width={size}
        height={size}
        className="h-full w-full rounded-[10px] object-cover"
        priority
      />
    </span>
  );
}

