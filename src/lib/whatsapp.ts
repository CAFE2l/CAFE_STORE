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

const DEFAULT_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5541996713782';

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
  return `https://wa.me/${DEFAULT_NUMBER}?text=${encoded}`;
}
