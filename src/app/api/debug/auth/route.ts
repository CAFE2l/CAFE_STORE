import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const googleId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? null
  const googleSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? null
  const authUrlLooksLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(process.env.AUTH_URL ?? '')

  return NextResponse.json({
    AUTH_URL: process.env.AUTH_URL ?? 'NAO DEFINIDA',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'NAO DEFINIDA',
    AUTH_URL_LOOKS_LOCALHOST_IN_PRODUCTION: process.env.NODE_ENV === 'production' && authUrlLooksLocalhost,
    AUTH_SECRET_EXISTS: Boolean(process.env.AUTH_SECRET),
    NEXTAUTH_SECRET_EXISTS: Boolean(process.env.NEXTAUTH_SECRET),
    AUTH_GOOGLE_ID_EXISTS: Boolean(process.env.AUTH_GOOGLE_ID),
    AUTH_GOOGLE_SECRET_EXISTS: Boolean(process.env.AUTH_GOOGLE_SECRET),
    GOOGLE_CLIENT_ID_EXISTS: Boolean(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET_EXISTS: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    GOOGLE_PROVIDER_ENABLED: Boolean(googleId && googleSecret),
    NODE_ENV: process.env.NODE_ENV,
  }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
