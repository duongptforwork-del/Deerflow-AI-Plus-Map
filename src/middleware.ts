import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'vi', 'ko', 'ja', 'fr'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle Locale Redirection
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = defaultLocale;
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // 2. Protect /[lang]/xyz_safe/ routes
  // Extract locale from path
  const segments = pathname.split('/');
  const lang = segments[1];
  const isXyzSafe = segments[2] === 'xyz_safe';

  if (isXyzSafe) {
    const hasAuth = request.cookies.has('admin_auth_session');
    
    // If accessing a sub-route (like /new or /edit) without auth, redirect to main xyz_safe
    if (!hasAuth && segments.length > 3) {
      return NextResponse.redirect(new URL(`/${lang}/xyz_safe`, request.url));
    }
  }

  return;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc.)
    '/((?!_next|api|favicon.ico|.*\\..*).*)',
  ],
};
