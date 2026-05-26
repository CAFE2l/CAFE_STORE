import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getBaseUrl, sendPasswordResetEmail } from '@/lib/email';
import { passwordResetRequestSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = passwordResetRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Dados invalidos.',
      },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  let devResetUrl: string | undefined;

  console.info('forgot-password: RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

  if (user) {
    const identifier = `password-reset:${email}`;
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    const resetUrl = `${getBaseUrl()}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
    devResetUrl = process.env.RESEND_API_KEY ? undefined : resetUrl;

    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token,
        expires,
      },
    });

    // Attempt to send the reset email and surface/log any error to aid debugging
    try {
      const sendResult = await sendPasswordResetEmail(email, resetUrl);
      if ((sendResult as any)?.skipped) {
        console.error('forgot-password: sendEmail skipped — Resend not configured or missing API key');
        return Response.json({ success: false, error: 'Envio de email não está configurado.' }, { status: 500 });
      }
      console.info('forgot-password: reset email requested for', email);
    } catch (err) {
      console.error('forgot-password: error sending reset email to', email, err);
      return Response.json({ success: false, error: 'Erro ao enviar email. Tente novamente.' }, { status: 500 });
    }
  }

  return Response.json({
    success: true,
    message: 'Se este email existir, enviaremos um link de redefinicao.',
    devResetUrl,
  });
}
