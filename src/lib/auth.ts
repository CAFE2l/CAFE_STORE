import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Role } from '@prisma/client';
import { compare } from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import { credentialsSchema } from '@/lib/validations';

const hasGoogleOAuth = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const loginAttempts = new Map<string, { count: number; blockedUntil?: number }>();
const maxLoginAttempts = 5;
const loginBlockMs = 15 * 60 * 1000;

function getLoginAttemptKey(email: string) {
  return email.trim().toLowerCase();
}

function isLoginBlocked(email: string) {
  const attempt = loginAttempts.get(getLoginAttemptKey(email));
  return Boolean(attempt?.blockedUntil && attempt.blockedUntil > Date.now());
}

function recordFailedLogin(email: string) {
  const key = getLoginAttemptKey(email);
  const current = loginAttempts.get(key) ?? { count: 0 };
  const count = current.count + 1;

  loginAttempts.set(key, {
    count,
    blockedUntil: count >= maxLoginAttempts ? Date.now() + loginBlockMs : undefined,
  });
}

function clearFailedLogins(email: string) {
  loginAttempts.delete(getLoginAttemptKey(email));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    ...(hasGoogleOAuth
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: 'Email e senha',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(rawCredentials) {
        const parsedCredentials = credentialsSchema.safeParse(rawCredentials);

        if (!parsedCredentials.success) {
          return null;
        }

        if (isLoginBlocked(parsedCredentials.data.email)) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: parsedCredentials.data.email.toLowerCase(),
          },
        });

        if (!user?.password) {
          recordFailedLogin(parsedCredentials.data.email);
          return null;
        }

        const passwordsMatch = await compare(parsedCredentials.data.password, user.password);

        if (!passwordsMatch) {
          recordFailedLogin(parsedCredentials.data.email);
          return null;
        }

        if (!user.emailVerified) {
          recordFailedLogin(parsedCredentials.data.email);
          return null;
        }

        clearFailedLogins(parsedCredentials.data.email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (user?.role) {
        token.role = user.role as Role;
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      if (!token.role) {
        token.role = 'CUSTOMER';
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }

      return session;
    },
  },
});
