'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type ProductTabsProps = {
  description: string | null;
  composition?: string;
  faq?: string;
};

const tabs = [
  { id: 'description', label: 'Descricao' },
  { id: 'composition', label: 'Composicao' },
  { id: 'faq', label: 'FAQ' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function ProductTabs({ composition, description, faq }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('description');
  const content = {
    description: description ?? 'Produto premium Cafe Store com selecao cuidadosa e preparo versatil.',
    composition: composition ?? 'Graos selecionados, torra controlada e embalagem pensada para preservar aroma.',
    faq: faq ?? 'Para melhor resultado, armazene fechado em local seco e prepare conforme sua moagem preferida.',
  };

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap gap-2 border-b border-border-subtle pb-2" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium transition',
              activeTab === tab.id
                ? 'bg-accent-primary text-background-base'
                : 'text-text-secondary hover:bg-background-surface hover:text-text-primary',
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="text-sm leading-7 text-text-secondary">{content[activeTab]}</p>
    </section>
  );
}
