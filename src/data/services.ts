export const SERVICES = {
  "landing-pages": {
    label: "Landing Pages",
    precoMinimo: 1200,
    precoMaximo: 2500,
    prazoMinDias: 5,
    prazoMaxDias: 7,
    orcamentos: [
      "R$ 1.200 – R$ 1.500",
      "R$ 1.500 – R$ 2.000",
      "R$ 2.000 – R$ 2.500",
    ],
    prazos: ["5–7 dias úteis", "7–10 dias úteis"],
  },
  "sites-profissionais": {
    label: "Sites Profissionais",
    precoMinimo: 2800,
    precoMaximo: 6000,
    prazoMinDias: 10,
    prazoMaxDias: 15,
    orcamentos: [
      "R$ 2.800 – R$ 3.500",
      "R$ 3.500 – R$ 5.000",
      "R$ 5.000 – R$ 6.000",
    ],
    prazos: ["10–15 dias úteis", "15–20 dias úteis", "20–30 dias úteis"],
  },
  "saas-webapp": {
    label: "Aplicações Web & SaaS",
    precoMinimo: null,
    precoMaximo: null,
    prazoMinDias: null,
    prazoMaxDias: null,
    orcamentos: [
      "R$ 5.000 – R$ 10.000",
      "R$ 10.000 – R$ 20.000",
      "R$ 20.000 – R$ 50.000",
      "Acima de R$ 50.000",
    ],
    prazos: ["30–60 dias", "60–90 dias", "90–120 dias", "A definir"],
  },
} as const;

export type ServiceKey = keyof typeof SERVICES;

export const SERVICE_KEYS = Object.keys(SERVICES) as ServiceKey[];

const SERVICE_ALIASES: Record<string, ServiceKey> = {
  "landing-page": "landing-pages",
  "site-profissional": "sites-profissionais",
  "aplicacao-web-saas": "saas-webapp",
  "landing-pages": "landing-pages",
  "sites-profissionais": "sites-profissionais",
  "saas-webapp": "saas-webapp",
};

export function normalizeServiceKey(slug: string): ServiceKey | null {
  return SERVICE_ALIASES[slug] ?? null;
}

export function isServiceKey(slug: string): slug is ServiceKey {
  return slug in SERVICES;
}
