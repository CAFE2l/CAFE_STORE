import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendPasswordChangedEmail } from '@/lib/email';
import { passwordResetSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = passwordResetSchema.safeParse(body);

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
  const identifier = `password-reset:${email}`;
  const resetToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier,
        token: parsed.data.token,
      },
    },
  });

  if (!resetToken || resetToken.expires < new Date()) {
    return Response.json(
      {
        success: false,
        error: 'Link de redefinicao invalido ou expirado.',
      },
      { status: 400 },
    );
  }

  const password = await hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { password },
    }),
    prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier,
          token: parsed.data.token,
        },
      },
    }),
  ]);

  await sendPasswordChangedEmail(email).catch(() => null);

  return Response.json({
    success: true,
  });
}
