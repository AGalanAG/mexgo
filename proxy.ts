import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames
  // Aseguramos que ignore archivos estáticos, api y el ícono
  matcher: [
    // Habilitar redirección automática en la raíz
    '/',
    
    // Set locales
    '/(en|es|fr)/:path*',

    // Habilitar todas las rutas excepto las de sistema
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
