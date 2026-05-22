import { cn } from '@/lib/utils';

type PriceBlockProps = {
  price: number;
  oldPrice?: number | null;
  className?: string;
  showInstallments?: boolean;
};

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function getDiscount(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) {
    return null;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function PriceBlock({ className, oldPrice, price, showInstallments }: PriceBlockProps) {
  const discount = getDiscount(price, oldPrice);

  return (
    <div className={cn('grid gap-1', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xl font-bold text-cafe-orange-500">{priceFormatter.format(price)}</span>
        {oldPrice ? oldPrice > price ? (
          <span className="text-sm text-text-muted line-through">{priceFormatter.format(oldPrice)}</span>
        ) : null : null}
        {discount ? (
          <span className="inline-flex rounded-badge bg-cafe-yellow-500 px-2 py-0.5 text-xs font-bold text-cafe-dark-900">
            -{discount}%
          </span>
        ) : null}
      </div>
      {showInstallments && price >= 20 ? (
        <span className="text-xs text-text-muted">
          ou 12x de {priceFormatter.format(price / 12)} sem juros
        </span>
      ) : null}
    </div>
  );
}
