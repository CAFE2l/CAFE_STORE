import { Resend } from 'resend';

const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'CAFÉ Store <no-reply@cafestore.local>';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
}

export async function sendEmail({ html, subject, to }: SendEmailInput) {
  if (!resend) {
    return { skipped: true };
  }

  await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
  });

  return { skipped: false };
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  return sendEmail({
    to,
    subject: 'Bem-vindo a CAFÉ Store',
    html: `<p>Ola${name ? `, ${name}` : ''}.</p><p>Sua conta CAFÉ Store foi criada.</p>`,
  });
}

export async function sendVerificationEmail(to: string, verificationUrl: string) {
  return sendEmail({
    to,
    subject: 'Confirme seu email na CAFÉ Store',
    html: `<p>Confirme seu email para ativar sua conta.</p><p><a href="${verificationUrl}">Confirmar email</a></p>`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: 'Redefina sua senha da CAFÉ Store',
    html: `<p>Recebemos uma solicitacao para redefinir sua senha.</p><p><a href="${resetUrl}">Criar nova senha</a></p><p>Este link expira em 1 hora.</p>`,
  });
}

export async function sendPasswordChangedEmail(to: string) {
  return sendEmail({
    to,
    subject: 'Senha alterada na CAFÉ Store',
    html: '<p>Sua senha foi alterada com sucesso. Se nao foi voce, entre em contato imediatamente.</p>',
  });
}
