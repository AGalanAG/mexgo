import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_LOCALE_PATHS = new Set(['/', '/register']);
const PROTECTED_LOCALE_PATHS = new Set(['/profile', '/onboarding', '/trips', '/chat', '/discover']);
const PROTECTED_NON_LOCALE_PATHS = new Set(['/profile', '/request']);
const BUSINESS_ALLOWED_ROLES = new Set(['ENCARGADO_NEGOCIO', 'EMPLEADO_NEGOCIO']);

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

function redirectToLanding(request: NextRequest, locale: string | null) {
  const targetLocale = locale || routing.defaultLocale;
  return NextResponse.redirect(new URL(`/${targetLocale}`, request.url));
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, path } = getLocaleAndPath(pathname);
  const isBusinessPath = path === '/business' || path.startsWith('/business/');

  const accessToken = request.cookies.get('mexgo_access_token')?.value || '';
  const primaryRole = request.cookies.get('mexgo_primary_role')?.value || '';
  const isLoggedIn = accessToken.trim().length > 0;

  if (pathname === '/requests' || path === '/requests') {
    return redirectToLanding(request, locale);
  }

  if (!locale && (pathname === '/business' || pathname.startsWith('/business/'))) {
    if (!isLoggedIn) {
      return redirectToLogin(request, null);
    }

    if (!BUSINESS_ALLOWED_ROLES.has(primaryRole)) {
      return redirectToLanding(request, null);
    }

    return NextResponse.next();
  }

  if (!locale && PROTECTED_NON_LOCALE_PATHS.has(pathname)) {
    if (!isLoggedIn) {
      return redirectToLogin(request, null);
    }

    if (pathname === '/request' && primaryRole === 'TURISTA') {
      return redirectToLanding(request, null);
    }

    if (pathname === '/profile' && primaryRole === 'TURISTA') {
      return NextResponse.redirect(new URL('/es/profile', request.url));
    }

    if (pathname === '/profile' && (primaryRole === 'ENCARGADO_NEGOCIO' || primaryRole === 'EMPLEADO_NEGOCIO')) {
      return redirectToLanding(request, null);
    }

    return NextResponse.next();
  }

  if (locale) {
    if (isBusinessPath) {
      if (!isLoggedIn) {
        return redirectToLogin(request, locale);
      }

      if (!BUSINESS_ALLOWED_ROLES.has(primaryRole)) {
        return redirectToLanding(request, locale);
      }
    }

    if (!PUBLIC_LOCALE_PATHS.has(path) && PROTECTED_LOCALE_PATHS.has(path) && !isLoggedIn) {
      return redirectToLogin(request, locale);
    }

    if (path === '/profile' && isLoggedIn && primaryRole && primaryRole !== 'TURISTA') {
      return redirectToLanding(request, locale);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
