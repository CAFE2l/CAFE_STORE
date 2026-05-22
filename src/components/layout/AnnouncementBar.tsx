import { Flame } from 'lucide-react';

export function AnnouncementBar() {
  return (
    <div className="gradient-fire relative overflow-hidden px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
      <div className="flex items-center justify-center gap-2">
        <Flame className="h-4 w-4 shrink-0" />
        <span className="truncate">FRETE GRÁTIS acima de R$ 150 | Use o cupom CAFE10</span>
      </div>
    </div>
  );
}
