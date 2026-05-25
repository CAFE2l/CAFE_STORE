export const SERVICE_SLUGS = {
  'landing-page': 'Landing Pages',
  'site-profissional': 'Sites Profissionais',
  'aplicacao-web-saas': 'Aplicações Web & SaaS',
} as const;

export type ServiceSlug = keyof typeof SERVICE_SLUGS;

export function getServiceName(slug: string): string {
  return SERVICE_SLUGS[slug as ServiceSlug] || slug;
}

export function getServicePrice(slug: string): string {
  const prices: Record<string, string> = {
    'landing-page': 'R$ 1.200',
    'site-profissional': 'R$ 2.800',
    'aplicacao-web-saas': 'Sob consulta',
  };
  return prices[slug] || 'Sob consulta';
}

export function getServiceDeadline(slug: string): string {
  const deadlines: Record<string, string> = {
    'landing-page': '5–7 dias úteis',
    'site-profissional': '10–15 dias úteis',
    'aplicacao-web-saas': 'sob consulta',
  };
  return deadlines[slug] || 'sob consulta';
}

export function getServiceSpecificFields(slug: string): string[] {
  const fields: Record<string, string[]> = {
    'landing-page': [
      'landingPageGoal',
      'landingPageProduct',
      'landingPageNeedsForm',
      'landingPageNeedsWhatsapp',
      'landingPageNeedsLeadCapture',
      'landingPageNeedsEmailMarketing',
    ],
    'site-profissional': [
      'sitePagesCount',
      'sitePagesList',
      'siteNeedsAdmin',
      'siteNeedsBlog',
      'siteNeedsSeo',
    ],
    'aplicacao-web-saas': [
      'appNeedsLogin',
      'appNeedsAdmin',
      'appNeedsDatabase',
      'appNeedsApi',
      'appNeedsPayments',
      'appUserTypesCount',
      'appMainFeatures',
    ],
  };
  return fields[slug] || [];
}

export function isValidService(slug: string): boolean {
  return slug in SERVICE_SLUGS;
}
