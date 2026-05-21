import { getToken } from 'next-auth/jwt';
import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/orders', '/profile', '/checkout'];
const adminRoutePrefix = '/admin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith(adminRoutePrefix);

  if ((isProtectedRoute || isAdminRoute) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/orders/:path*', '/profile/:path*', '/checkout/:path*', '/admin/:path*'],
};
