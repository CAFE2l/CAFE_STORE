import { SERVICES, normalizeServiceKey, type ServiceKey } from '@/data/services';

export const SERVICE_SLUGS = SERVICES;

export type ServiceSlug = ServiceKey;

export function getServiceName(slug: string): string {
  const serviceKey = normalizeServiceKey(slug);
  return serviceKey ? SERVICES[serviceKey].label : slug;
}

export function getServicePrice(slug: string): string {
  const serviceKey = normalizeServiceKey(slug);
  if (!serviceKey) return 'Sob consulta';

  const price = SERVICES[serviceKey].precoMinimo;
  return price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(price) : 'Sob consulta';
}

export function getServiceDeadline(slug: string): string {
  const serviceKey = normalizeServiceKey(slug);
  return serviceKey ? SERVICES[serviceKey].prazos[0] : 'sob consulta';
}

export function getServiceSpecificFields(slug: string): string[] {
  const serviceKey = normalizeServiceKey(slug);
  const fields: Record<string, string[]> = {
    'landing-pages': [
      'landingPageGoal',
      'landingPageProduct',
      'landingPageNeedsForm',
      'landingPageNeedsWhatsapp',
      'landingPageNeedsLeadCapture',
      'landingPageNeedsEmailMarketing',
    ],
    'sites-profissionais': [
      'sitePagesCount',
      'sitePagesList',
      'siteNeedsAdmin',
      'siteNeedsBlog',
      'siteNeedsSeo',
    ],
    'saas-webapp': [
      'appNeedsLogin',
      'appNeedsAdmin',
      'appNeedsDatabase',
      'appNeedsApi',
      'appNeedsPayments',
      'appUserTypesCount',
      'appMainFeatures',
    ],
  };
  return serviceKey ? fields[serviceKey] : [];
}

export function isValidService(slug: string): boolean {
  return Boolean(normalizeServiceKey(slug));
}
