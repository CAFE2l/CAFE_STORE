import { cn } from '@/lib/utils';

type PriceBlockProps = {
  price: number;
  className?: string;
  showInstallments?: boolean;
};

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function PriceBlock({ className, price, showInstallments }: PriceBlockProps) {
  return (
    <div className={cn('grid gap-1', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xl font-bold text-cafe-orange-500">{priceFormatter.format(price)}</span>
      </div>
      {showInstallments && price >= 20 ? (
        <span className="text-xs text-text-muted">
          ou 12x de {priceFormatter.format(price / 12)} sem juros
        </span>
      ) : null}
    </div>
  );
}
