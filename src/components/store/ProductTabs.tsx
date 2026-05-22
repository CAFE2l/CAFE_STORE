'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type ProductTabsProps = {
  category?: string;
  description: string | null;
  dimensions?: string;
  material?: string;
  productName?: string;
  composition?: string;
  faq?: string;
};

const tabs = [
  { id: 'description', label: 'Descricao' },
  { id: 'composition', label: 'Composicao' },
  { id: 'faq', label: 'FAQ' },
] as const;

type TabId = (typeof tabs)[number]['id'];

function getDefaultSpecs(category?: string) {
  if (category === 'Camisetas') {
    return {
      material: 'Malha premium com toque macio, estampa digital de alta definicao e acabamento reforcado.',
      dimensions: 'Grade P ao XG. Confira a variacao selecionada antes de comprar.',
      care: 'Lavar do avesso, nao usar alvejante e secar a sombra para preservar a estampa.',
    };
  }

  if (category === 'Canecas') {
    return {
      material: 'Ceramica brilhante com impressao resistente e interior colorido.',
      dimensions: 'Capacidade aproximada de 325ml.',
      care: 'Evite impactos e lave com esponja macia para manter o brilho.',
    };
  }

  if (category === 'Moletons') {
    return {
      material: 'Moletom encorpado, interior confortavel e estampa exclusiva CAFÉ Store.',
      dimensions: 'Grade P ao XG com modelagem casual.',
      care: 'Lavar do avesso em ciclo suave e nao passar ferro sobre a estampa.',
    };
  }

  return {
    material: 'Produto oficial CAFÉ Store com acabamento personalizado e arte exclusiva.',
    dimensions: 'Dimensoes variam por modelo. Confira a variacao e disponibilidade antes da compra.',
    care: 'Manuseie com cuidado e siga as instrucoes do produto para preservar a personalizacao.',
  };
}

export function ProductTabs({ category, composition, description, dimensions, faq, material, productName }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('description');
  const specs = getDefaultSpecs(category);
  const content = {
    description:
      description ??
      `${productName ?? 'Produto CAFÉ Store'} oficial, criado para levar a identidade da comunidade para o dia a dia.`,
    composition: composition ?? `${material ?? specs.material} ${dimensions ?? specs.dimensions}`,
    faq:
      faq ??
      `${specs.care} Trocas e devolucoes seguem a politica de 7 dias apos o recebimento, desde que o item esteja sem sinais de uso.`,
  };

  return (
    <section className="grid gap-6">
      <div className="flex border-b border-border-subtle" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={cn(
              'px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-cafe-red-500 text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-in">
        <p className="text-sm leading-7 text-text-secondary">{content[activeTab]}</p>
      </div>
    </section>
  );
}
