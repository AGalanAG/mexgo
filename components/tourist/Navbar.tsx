"use client";

import Link from 'next/link';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

interface NavbarProps {
  variant?: 'dark' | 'light';
}

export default function Navbar({ variant = 'dark' }: NavbarProps) {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isLight = variant === 'light';

  const toggleLocale = () => {
    const nextLocale = locale === 'es' ? 'en' : 'es';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav
      className={`${
        isLight
          ? 'fixed top-0 left-0 bg-white text-[var(--text-primary)] shadow-sm'
          : 'absolute top-0 left-1/2 -translate-x-1/2 text-white'
      } w-full p-4 md:p-6 flex justify-between items-center z-50 transition-all ${!isLight ? 'max-w-7xl' : ''}`}
    >
      {/* Logo */}
      <Link
        href="/"
        className="font-bold text-2xl leading-tight cursor-pointer"
        style={{ fontFamily: 'var(--font-display, inherit)' }}
      >
        {isLight ? 'MexGo' : <>Mex<br />GO</>}
      </Link>

      {/* Menú Central */}
      <div className="hidden md:flex gap-8 font-medium">
        <Link href="/discover" className="hover:opacity-70 transition-opacity">{t('discover')}</Link>
        <Link href="/trips" className="hover:opacity-70 transition-opacity">{t('trips')}</Link>
        <Link href="#" className="hover:opacity-70 transition-opacity">{t('more')}</Link>
      </div>

      {/* Iconos MUI */}
      <div className="flex gap-5 items-center">
        <button
          onClick={toggleLocale}
          className="hover:opacity-70 transition-opacity flex items-center gap-1 uppercase text-sm font-bold"
        >
          <LanguageIcon fontSize="small" />
          {locale}
        </button>
        <button className="hover:opacity-70 transition-opacity">
          <AccountCircleIcon fontSize="medium" />
        </button>
        {!isLight && (
          <button className="hover:opacity-70 transition-opacity">
            <ModeNightIcon fontSize="medium" />
          </button>
        )}
      </div>
    </nav>
  );
}
