'use client';

import { ReactNode } from 'react';

type SettingsCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingsCard({ icon, title, description, children }: SettingsCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-6 shadow-card backdrop-blur">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}
