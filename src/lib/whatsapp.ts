interface WhatsAppData {
  name: string;
  email: string;
  whatsapp: string;
  serviceType: string;
  serviceName?: string;
  projectDescription: string;
  budget?: string;
  deadline?: string;
  companyName?: string;
  mainGoal?: string;
  targetAudience?: string;
  references?: string;
  desiredFeatures?: string[];
  hasDomain?: boolean;
  hasHosting?: boolean;
  hasBranding?: boolean;
  preferredContact?: string;
  extraNotes?: string;
  [key: string]: unknown;
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5541996713782';

export function createWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const whatsappMessages = {
  pacoteCompleto: `Olá! Tenho interesse no *Pacote Completo* da CAFÉ STORE.

Quero saber mais sobre o pacote que inclui:

- 2 banners
- 2 ícones para marca/app
- apresentação com 10 slides
- web application completa
- landing page de alta conversão
- 3 vídeos curtos
- 1 vídeo longo
- documentação com 10 páginas

Vi que o investimento único é de *R$ 10.000* e gostaria de conversar sobre meu projeto.

Pode me passar mais informações?`,

  landingPage: `Olá! Tenho interesse no serviço de *Landing Page* da CAFÉ STORE.

Quero criar uma página de alta conversão para meu projeto, com design profissional, responsividade e integração com WhatsApp/formulário.

Vi que o valor começa a partir de *R$ 1.200* e gostaria de conversar sobre a ideia.

Pode me passar mais informações?`,

  siteProfissional: `Olá! Tenho interesse no serviço de *Site Profissional* da CAFÉ STORE.

Quero criar um site completo para minha marca/empresa, com páginas como Home, Sobre, Serviços, Portfólio e Contato.

Vi que o valor começa a partir de *R$ 2.800* e gostaria de conversar sobre meu projeto.

Pode me passar mais informações?`,

  webSaas: `Olá! Tenho interesse no serviço de *Aplicações Web & SaaS* da CAFÉ STORE.

Quero desenvolver uma aplicação web/sistema com estrutura profissional, podendo incluir autenticação, banco de dados, API, painel administrativo e funcionalidades personalizadas.

Vi que esse serviço é *sob consulta* e gostaria de explicar minha ideia.

Pode me passar mais informações?`,

  telegramVipAccess: `Olá! Já sou cliente da CAFÉ STORE e gostaria de solicitar acesso ao Telegram VIP.

Meu nome: [seu nome]
Serviço contratado: [serviço]
Data aproximada do atendimento: [data]

Pode verificar meu acesso?`,

  generic: `Olá! Tenho interesse nos serviços da CAFÉ STORE. Pode me passar mais informações?`,
};

export function generateWhatsAppMessage(data: WhatsAppData): string {
  const lines: string[] = [
    'Olá! Quero contratar um serviço da CAFÉ STORE.',
    '',
    `*Serviço:* ${data.serviceName || data.serviceType}`,
    `*Nome:* ${data.name}`,
    `*E-mail:* ${data.email}`,
    `*WhatsApp:* ${data.whatsapp}`,
  ];

  if (data.companyName) {
    lines.push(`*Empresa/Marca:* ${data.companyName}`);
  }

  lines.push('', '*Descrição do projeto:*', data.projectDescription);

  if (data.mainGoal) {
    lines.push('', '*Objetivo principal:*', data.mainGoal);
  }

  if (data.targetAudience) {
    lines.push('', '*Público-alvo:*', data.targetAudience);
  }

  lines.push('', `*Orçamento aproximado:* ${data.budget || 'Não informado'}`);
  lines.push('', `*Prazo desejado:* ${data.deadline || 'Não informado'}`);

  if (data.references) {
    lines.push('', '*Referências visuais:*', data.references);
  }

  if (data.desiredFeatures && data.desiredFeatures.length > 0) {
    lines.push('', '*Funcionalidades desejadas:*');
    data.desiredFeatures.forEach((feature) => {
      lines.push(`- ${feature}`);
    });
  }

  lines.push(
    '',
    `*Já possui domínio:* ${data.hasDomain ? 'Sim' : 'Não'}`,
    `*Já possui hospedagem:* ${data.hasHosting ? 'Sim' : 'Não'}`,
    `*Já possui identidade visual:* ${data.hasBranding ? 'Sim' : 'Não'}`,
  );

  if (data.preferredContact) {
    const label = data.preferredContact === 'whatsapp' ? 'WhatsApp' : 'E-mail';
    lines.push('', `*Prefere contato por:* ${label}`);
  }

  if (data.extraNotes) {
    lines.push('', '*Observações adicionais:*', data.extraNotes);
  }

  lines.push('', '---', 'Briefing enviado pelo site CAFÉ STORE.');

  return lines.join('\n');
}

export function generateWhatsAppUrl(data: WhatsAppData): string {
  const message = generateWhatsAppMessage(data);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}
