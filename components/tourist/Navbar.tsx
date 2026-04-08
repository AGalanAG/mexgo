"use client";

import React, { useState } from 'react';
import { Link, useRouter, usePathname, routing } from '@/i18n/routing';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import LanguageIcon from '@mui/icons-material/Language';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';

interface NavbarProps {
  variant?: 'dark' | 'light';
}

export default function Navbar({ variant = 'dark' }: NavbarProps) {
  const isLight = variant === 'light';
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();

  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  const handleThemeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setThemeAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setThemeAnchor(null);
    setProfileAnchor(null);
  };

  const handleThemeSelect = (theme: string) => {
    setTheme(theme);
    handleClose();
  };

  const toggleLocale = () => {
    const locales = routing.locales;
    const currentIndex = locales.indexOf(locale as any);
    const nextLocale = locales[(currentIndex + 1) % locales.length];
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className={`absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 max-w-7xl mx-auto left-1/2 -translate-x-1/2 ${isLight ? 'text-gray-800' : 'text-white'}`}>
      {/* Logo */}
      <div 
        className="font-bold text-2xl leading-tight cursor-pointer" 
        onClick={() => router.push('/')}
      >
        Mex<br />GO
      </div>

      {/* Menú Central */}
      <div className="hidden md:flex gap-8 font-medium">
        <Link href="/discover" className="hover:opacity-70 transition-opacity">{t('discover')}</Link>
        <Link href="/trips" className="hover:opacity-70 transition-opacity">{t('trips')}</Link>
        <Link href="/chat" className="hover:opacity-70 transition-opacity">{t('chat')}</Link>
      </div>

      {/* Iconos */}
      <div className="flex gap-5 items-center">
        {/* Idioma */}
        <button
          onClick={toggleLocale}
          className={`hover:opacity-70 transition-opacity flex items-center gap-1 uppercase text-sm font-bold ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/20'} px-3 py-1 rounded-full backdrop-blur-sm border`}
        >
          <LanguageIcon fontSize="small" />
          {locale}
        </button>

        {/* Perfil */}
        <button
          onClick={(e) => setProfileAnchor(e.currentTarget)}
          className="hover:opacity-70 transition-opacity"
        >
          <AccountCircleIcon fontSize="medium" />
        </button>
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleClose}
          slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, minWidth: 180 } } }}
        >
          <MenuItem
            onClick={handleClose}
            component={Link}
            href="/profile"
            sx={{ fontSize: 14, fontWeight: 700, gap: 1.5 }}
          >
            <PersonIcon fontSize="small" /> Mi perfil
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => { handleClose(); router.push('/'); }}
            sx={{ fontSize: 14, fontWeight: 700, color: 'error.main', gap: 1.5 }}
          >
            <LogoutIcon fontSize="small" /> Cerrar sesión
          </MenuItem>
        </Menu>

        {/* Dark Mode */}
        <button
          className="hover:opacity-70 transition-opacity"
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
