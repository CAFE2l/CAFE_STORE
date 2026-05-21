import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

type PriceBlockProps = {
  price: number;
  oldPrice?: number | null;
  className?: string;
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

export function PriceBlock({ className, oldPrice, price }: PriceBlockProps) {
  const discount = getDiscount(price, oldPrice);

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <span className="text-2xl font-bold text-text-primary">{priceFormatter.format(price)}</span>
      {oldPrice ? (
        <span className="text-sm text-text-muted line-through">{priceFormatter.format(oldPrice)}</span>
      ) : null}
      {discount ? <Badge variant="amber">-{discount}%</Badge> : null}
    </div>
  );
}
