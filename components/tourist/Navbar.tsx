"use client";

import React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'es' ? 'en' : 'es';
    router.replace(pathname, {locale: nextLocale});
  };

  return (
    <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center text-white z-50 max-w-7xl mx-auto left-1/2 -translate-x-1/2">
      {/* Logo */}
      <div className="font-bold text-2xl leading-tight cursor-pointer" onClick={() => router.push('/')}>
        Mex<br />GO
      </div>

      {/* Menú Central */}
      <div className="hidden md:flex gap-8 font-medium">
        <a href="#" className="hover:text-gray-300 transition-colors">{t('discover')}</a>
        <a href="#" className="hover:text-gray-300 transition-colors">{t('trips')}</a>
        <a href="#" className="hover:text-gray-300 transition-colors">{t('more')}</a>
      </div>

      {/* Iconos MUI */}
      <div className="flex gap-5 items-center">
        <button 
          onClick={toggleLocale}
          className="hover:text-gray-300 transition-colors flex items-center gap-1 uppercase text-sm font-bold"
        >
          <LanguageIcon fontSize="small" />
          {locale}
        </button>
        <button className="hover:text-gray-300 transition-colors">
          <AccountCircleIcon fontSize="medium" />
        </button>
        <button className="hover:text-gray-300 transition-colors">
          <ModeNightIcon fontSize="medium" />
        </button>
      </div>
    </nav>
  );
}
