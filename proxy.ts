import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_LOCALE_PATHS = new Set(['/', '/register']);
const PROTECTED_LOCALE_PATHS = new Set(['/profile', '/onboarding', '/trips', '/chat', '/discover']);
const PROTECTED_NON_LOCALE_PATHS = new Set(['/profile', '/request', '/requests']);

function getLocaleAndPath(pathname: string) {
  const match = pathname.match(/^\/(en|es|fr)(\/.*)?$/);
  if (!match) {
    return { locale: null, path: pathname };
  }

  return {
    locale: match[1],
    path: match[2] || '/',
  };
}

function redirectToLogin(request: NextRequest, locale: string | null) {
  const targetLocale = locale || routing.defaultLocale;
  const url = new URL(`/${targetLocale}`, request.url);
  url.searchParams.set('login', '1');
  return NextResponse.redirect(url);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, path } = getLocaleAndPath(pathname);

  const accessToken = request.cookies.get('mexgo_access_token')?.value || '';
  const primaryRole = request.cookies.get('mexgo_primary_role')?.value || '';
  const isLoggedIn = accessToken.trim().length > 0;

  if (!locale && PROTECTED_NON_LOCALE_PATHS.has(pathname)) {
    if (!isLoggedIn) {
      return redirectToLogin(request, null);
    }

    if (pathname === '/requests' && !(primaryRole === 'ADMIN' || primaryRole === 'SUPERADMIN')) {
      return NextResponse.redirect(new URL('/es', request.url));
    }

    if ((pathname === '/profile' || pathname === '/request') && primaryRole === 'TURISTA') {
      return NextResponse.redirect(new URL('/es/profile', request.url));
    }

    return NextResponse.next();
  }

  if (locale) {
    if (!PUBLIC_LOCALE_PATHS.has(path) && PROTECTED_LOCALE_PATHS.has(path) && !isLoggedIn) {
      return redirectToLogin(request, locale);
    }

    if (path === '/profile' && isLoggedIn && primaryRole && primaryRole !== 'TURISTA') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
