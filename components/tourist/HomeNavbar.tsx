"use client";
import React, { useState } from 'react';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import LanguageIcon from '@mui/icons-material/Language';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from 'next-themes';
import { useLogin } from '@/context/LoginContext';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/routing';

export default function HomeNavbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { openLogin, openRegister } = useLogin();

  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);

  const handleLangClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLangAnchor(event.currentTarget);
  };

  const handleThemeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setThemeAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setLangAnchor(null);
    setThemeAnchor(null);
  };

  const handleThemeSelect = (theme: string) => {
    setTheme(theme);
    handleClose();
  };

  const toggleLocale = (nextLocale: string) => {
    router.replace(pathname, {locale: nextLocale});
    handleClose();
  };

  return (
    <nav className="absolute top-0 left-1/2 -translate-x-1/2 w-full p-6 flex justify-between items-center text-white z-50 max-w-7xl mx-auto">
      {/* Logo */}
      <Link href="/" className="font-bold text-2xl leading-tight cursor-pointer">
        Mex<br />GO
      </Link>

      {/* Menú Central */}
      <div className="hidden md:flex gap-8 font-medium">
        <Link href="/discover" className="hover:text-gray-300 transition-colors">{t('discover')}</Link>
        <Link href="/trips" className="hover:text-gray-300 transition-colors">{t('trips')}</Link>
        <Link href="#" className="hover:text-gray-300 transition-colors">{t('more')}</Link>
      </div>

      {/* Iconos y Botones */}
      <div className="flex gap-5 items-center">
        <button 
          onClick={openLogin}
          className="text-sm font-medium hover:text-gray-300 transition-colors"
        >
          {t('login')}
        </button>
        <button 
          onClick={openRegister}
          className="text-sm font-medium hover:text-gray-300 transition-colors hidden sm:block"
        >
          {t('register')}
        </button>

        {/* Idioma */}
        <button 
          className="hover:text-gray-300 transition-colors flex items-center gap-1 uppercase text-sm font-bold"
          onClick={handleLangClick}
        >
          <LanguageIcon fontSize="small" />
          {locale}
        </button>
        <Menu
          anchorEl={langAnchor}
          open={Boolean(langAnchor)}
          onClose={handleClose}
          className="mt-2"
        >
          <MenuItem onClick={() => toggleLocale('es')}>Español</MenuItem>
          <MenuItem onClick={() => toggleLocale('en')}>English</MenuItem>
        </Menu>

        {/* Dark Mode */}
        <button 
          className="hover:text-gray-300 transition-colors"
          onClick={handleThemeClick}
        >
          <ModeNightIcon fontSize="medium" />
        </button>
        <Menu
          anchorEl={themeAnchor}
          open={Boolean(themeAnchor)}
          onClose={handleClose}
          className="mt-2"
        >
          <MenuItem onClick={() => handleThemeSelect('light')}>Luminoso</MenuItem>
          <MenuItem onClick={() => handleThemeSelect('dark')}>Oscuro</MenuItem>
          <MenuItem onClick={() => handleThemeSelect('system')}>Sistema</MenuItem>
        </Menu>
      </div>
    </nav>
  );
}
