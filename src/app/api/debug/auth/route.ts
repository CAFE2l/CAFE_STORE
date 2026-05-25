import { NextResponse } from 'next/server'

export async function GET() {
  const googleId = process.env.AUTH_GOOGLE_ID ?? null
  const googleSecret = process.env.AUTH_GOOGLE_SECRET ?? null
  const nextauthUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? null
  const nextauthSecret = process.env.NEXTAUTH_SECRET ?? null
  return NextResponse.json({
    google: {
      enabled: Boolean(googleId && googleSecret),
      clientId: googleId ? (googleId.length > 6 ? googleId.slice(0, 3) + '...' + googleId.slice(-3) : googleId) : null,
    },
    nextauth: {
      url: nextauthUrl,
      hasSecret: Boolean(nextauthSecret),
    },
  })
}
