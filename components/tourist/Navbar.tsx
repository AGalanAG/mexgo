"use client";

import React, { useState } from 'react';
import { Link, useRouter, usePathname } from '@/i18n/routing';
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

  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  const handleLangClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLangAnchor(event.currentTarget);
  };

  const handleThemeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setThemeAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setLangAnchor(null);
    setThemeAnchor(null);
    setProfileAnchor(null);
  };

  const handleThemeSelect = (theme: string) => {
    setTheme(theme);
    handleClose();
  };

  const toggleLocale = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
    handleClose();
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
        <Link href="/chat" className="hover:opacity-70 transition-opacity">{t('chat')}</Link>
      </div>

      {/* Iconos */}
      <div className="flex gap-5 items-center">
        {/* Idioma */}
        <button
          className="hover:opacity-70 transition-opacity flex items-center gap-1 uppercase text-sm font-bold"
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