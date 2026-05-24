import { Flame } from 'lucide-react';

export function AnnouncementBar() {
  return (
    <div className="relative w-full border-b border-brand/20 bg-gradient-to-r from-brand/10 via-brand/20 to-brand/10 py-2.5 text-center text-sm font-medium tracking-wide text-brand/90">
      <div className="flex items-center justify-center gap-2">
        <Flame className="h-4 w-4 shrink-0 text-brand animate-pulse-led" />
        <span>CAFÉ STORE — Sites, landing pages, web apps e apoios simbolicos</span>
      </div>
    </div>
  );
}
