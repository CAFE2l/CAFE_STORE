import type { LucideIcon } from 'lucide-react';
import { Globe2, Monitor, Zap } from 'lucide-react';

export const WHATSAPP = 'https://wa.me/5541996713782?text=Olá,%20tenho%20interesse%20nos%20serviços%20CAFÉ!';

export type Service = {
  icon: LucideIcon;
  title: string;
  slug: string;
  tagline: string;
  price: string;
  pricePrefix: string;
  deadline: string;
  badge?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
};

export const services: Service[] = [
  {
    icon: Monitor,
    title: 'Landing Pages',
    slug: 'landing-page',
    tagline: 'Páginas que convertem visitantes em clientes',
    pricePrefix: 'A partir de',
    price: 'R$ 1.200',
    deadline: 'Prazo: 5–7 dias úteis',
    description:
      'Landing page de alta conversão com design persuasivo, animações suaves, formulário integrado e estrutura pronta para campanha.',
    features: [
      'Design responsivo único',
      'Animações e microinterações',
      'Formulário integrado por e-mail ou WhatsApp',
      'SEO on-page básico',
      'Deploy incluso em Vercel ou Netlify',
      'Prazo de 5–7 dias úteis',
    ],
    cta: 'Quero uma Landing Page',
    href: WHATSAPP,
  },
  {
    icon: Globe2,
    title: 'Sites Profissionais',
    slug: 'site-profissional',
    tagline: 'Presença digital completa para sua marca',
    pricePrefix: 'A partir de',
    price: 'R$ 2.800',
    deadline: 'Prazo: 10–15 dias úteis',
    description:
      'Site institucional com múltiplas páginas, identidade visual alinhada ao negócio e estrutura clara para apresentar serviços, portfólio e contato.',
    features: [
      'Até 8 páginas: Home, Sobre, Serviços, Portfólio e Contato',
      'Design responsivo mobile-first',
      'Painel administrativo para editar conteúdo',
      'Formulário de contato integrado',
      'Google Analytics configurado',
      'Prazo de 10–15 dias úteis',
    ],
    cta: 'Quero meu Site',
    href: WHATSAPP,
  },
  {
    icon: Zap,
    title: 'Aplicações Web & SaaS',
    slug: 'aplicacao-web-saas',
    tagline: 'Do MVP ao produto que escala',
    pricePrefix: '',
    price: 'Sob consulta',
    deadline: 'Prazo: sob consulta',
    badge: '🔥 MAIS PEDIDO',
    description:
      'Aplicações web completas, de ferramentas internas a produtos SaaS com autenticação, banco de dados, API e painel administrativo.',
    features: [
      'Frontend completo com React ou Next.js',
      'Backend robusto em Node.js',
      'Banco de dados PostgreSQL',
      'API REST documentada',
      'Sistema de autenticação e usuários',
      'Painel administrativo',
    ],
    cta: 'Falar sobre meu projeto',
    href: WHATSAPP,
  },
];

export type Deliverable = {
  emoji: string;
  title: string;
  detail: string;
};

export const deliverables: Deliverable[] = [
  { emoji: '🖼️', title: '2 Banners', detail: '+ 1 favicon' },
  { emoji: '🎨', title: '2 Ícones', detail: 'para marca/app' },
  { emoji: '📊', title: 'Apresentação', detail: '10 slides' },
  { emoji: '💻', title: 'Web Application', detail: 'completa' },
  { emoji: '🚀', title: 'Landing Page', detail: 'de alta conversão' },
  { emoji: '🎬', title: '3 Vídeos Curtos', detail: '30 segundos cada' },
  { emoji: '📹', title: '1 Vídeo Longo', detail: 'até 10 minutos' },
  { emoji: '📄', title: 'Documentação', detail: '10 páginas' },
];

export type Project = {
  name: string;
  tags: string[];
  desc: string;
  metric: string;
  href: string;
};

export const projects: Project[] = [
  {
    name: 'CAFÉ STORE',
    tags: ['E-commerce', 'Next.js', 'Checkout'],
    desc: 'Loja virtual completa com catálogo, carrinho, checkout, painel administrativo e área do cliente.',
    metric: 'Loja completa no ar',
    href: '/',
  },
  {
    name: 'Painel Financeiro SaaS',
    tags: ['Web App', 'React', 'Node.js'],
    desc: 'Dashboard operacional com autenticação, gráficos, relatórios e gerenciamento de usuários.',
    metric: 'Fluxo interno automatizado',
    href: '#contato',
  },
  {
    name: 'Landing Page de Conversão',
    tags: ['Landing Page', 'SEO', 'Performance'],
    desc: 'Página de campanha com copy, formulário integrado, estrutura responsiva e deploy otimizado.',
    metric: 'Entrega em 5 dias',
    href: '#contato',
  },
];

export type Testimonial = {
  stars: number;
  text: string;
  name: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    stars: 5,
    text: 'A landing page saiu rápida, bonita e pronta para campanha. O processo foi direto, com retorno claro em cada etapa.',
    name: 'Lucas Mendes',
    role: 'Agência Criativa',
  },
  {
    stars: 5,
    text: 'O projeto foi entregue com qualidade e sem enrolação. A parte visual ficou muito acima do que eu esperava.',
    name: 'Ana Carolina',
    role: 'Empreendedora Digital',
  },
  {
    stars: 5,
    text: 'A documentação e o painel facilitaram demais o onboarding da equipe. Tudo ficou organizado e fácil de manter.',
    name: 'Rafael Torres',
    role: 'CTO @ TechStart',
  },
];

export type ProcessStep = {
  num: number;
  title: string;
  desc: string;
};

export const processSteps: ProcessStep[] = [
  { num: 1, title: 'Briefing', desc: 'Você me conta o objetivo, referências e escopo.' },
  { num: 2, title: 'Proposta', desc: 'Eu envio preço, prazo, entregáveis e forma de pagamento.' },
  { num: 3, title: 'Produção', desc: 'Desenvolvimento com atualizações durante o processo.' },
  { num: 4, title: 'Revisão', desc: 'Você testa, valida e pede ajustes dentro do combinado.' },
  { num: 5, title: 'Entrega', desc: 'Deploy, arquivos finais e documentação do projeto.' },
];

export type Faq = {
  q: string;
  a: string;
};

export const faqs: Faq[] = [
  {
    q: 'Como funciona o processo de pagamento?',
    a: '50% na contratação e 50% na entrega. Para o Pacote Completo, parcelamento em até 3x pode ser negociado.',
  },
  {
    q: 'Posso contratar apenas parte do Pacote Completo?',
    a: 'Sim! Cada serviço pode ser contratado individualmente. O pacote existe para quem precisa de tudo de uma vez com melhor custo.',
  },
  {
    q: 'Quais são os prazos de entrega?',
    a: 'Landing Page: 5–7 dias úteis. Sites: 10–15 dias. Aplicações e Pacote Completo: combinado no briefing conforme escopo.',
  },
];
