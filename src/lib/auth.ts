import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Role } from '@prisma/client';
import { compare } from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import { credentialsSchema } from '@/lib/validations';

const isProduction = process.env.NODE_ENV === 'production';
const hasLocalhostAuthUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(process.env.AUTH_URL ?? '');

if (isProduction && hasLocalhostAuthUrl) {
  const productionUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL}`
      : undefined);

  if (productionUrl) {
    try {
      delete process.env.AUTH_URL;
    } catch {
      try {
        process.env.AUTH_URL = productionUrl;
      } catch {
        // environment is fully read-only; nothing we can do
      }
    }
  }
}

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
const hasGoogleOAuth = Boolean(googleClientId && googleClientSecret);
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
  secret: authSecret,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },
  useSecureCookies: isProduction,
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  trustHost: true,
  providers: [
    ...(hasGoogleOAuth
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
            checks: ['state'],
            authorization: {
              params: {
                prompt: 'consent',
                access_type: 'offline',
                response_type: 'code',
              },
            },
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

        if (user?.deletedAt) {
          recordFailedLogin(parsedCredentials.data.email);
          return null;
        }

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
    async signIn({ user }) {
      if (!user.email) return true;

      const existing = await prisma.user.findUnique({
        where: { email: user.email },
        select: { deletedAt: true },
      });

      return !existing?.deletedAt;
    },
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
