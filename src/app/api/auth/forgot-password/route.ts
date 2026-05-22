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
    await sendPasswordResetEmail(email, resetUrl).catch(() => null);
  }

  return Response.json({
    success: true,
    message: 'Se este email existir, enviaremos um link de redefinicao.',
    devResetUrl,
  });
}
