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
import { clearSession, getStoredSession } from '@/lib/client-auth';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    const session = getStoredSession();
    setIsAuthenticated(Boolean(session?.accessToken));
  }, []);

  const [themeAnchor,   setThemeAnchor]   = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [langAnchor,    setLangAnchor]    = useState<null | HTMLElement>(null);

  const handleClose = () => {
    setThemeAnchor(null);
    setProfileAnchor(null);
    setLangAnchor(null);
  };

  const toggleLocale = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
    handleClose();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--primary)] text-white border-b-4 border-[var(--secondary)]">
      <div className="container-responsive py-3 flex items-center">

<<<<<<< HEAD
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
        {isAuthenticated ? (
          <>
            <Link href="/profile" className="hover:opacity-70 transition-opacity">
              <AccountCircleIcon fontSize="medium" />
            </Link>
            <button
              onClick={() => {
                clearSession();
                setIsAuthenticated(false);
                router.push('/');
              }}
              className="text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
            >
              Salir
            </button>
          </>
        ) : (
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <AccountCircleIcon fontSize="medium" />
          </Link>
        )}
=======
        {/* Logo — igual que home */}
        <div className="flex-1 flex justify-start">
          <div
            className="font-extrabold text-2xl cursor-pointer"
            onClick={() => router.push('/')}
          >
            Mex<span className="text-[var(--secondary)]">GO</span>
          </div>
        </div>
>>>>>>> feat/xavier-qa-ui

        {/* Menú Central */}
        <div className="hidden md:flex gap-8 font-semibold text-sm">
          <Link
            href="/discover"
            className="hover:text-[var(--secondary)] transition-colors"
          >
            {t('discover')}
          </Link>
          <Link
            href="/trips"
            className="hover:text-[var(--secondary)] transition-colors"
          >
            {t('trips')}
          </Link>
          <Link
            href="/chat"
            className="hover:text-[var(--secondary)] transition-colors"
          >
            {t('chat')}
          </Link>
        </div>

        {/* Iconos */}
        <div className="flex-1 flex justify-end gap-4 items-center">

          {/* Idioma */}
          <button
            onClick={(e) => setLangAnchor(e.currentTarget)}
            className="flex items-center gap-1 uppercase text-sm font-bold px-3 py-1 rounded-full border border-white/30 bg-white/10 hover:bg-[var(--secondary)] hover:text-[var(--primary)] hover:border-[var(--secondary)] transition-all"
          >
            <LanguageIcon fontSize="small" />
            <span className="hidden sm:inline">{locale}</span>
          </button>
          <Menu
            anchorEl={langAnchor}
            open={Boolean(langAnchor)}
            onClose={handleClose}
            slotProps={{ paper: { sx: { mt: 1, borderRadius: 2 } } }}
          >
            <MenuItem onClick={() => toggleLocale('es')} sx={{ fontSize: 14, fontWeight: 700 }}>🇲🇽 Español</MenuItem>
            <MenuItem onClick={() => toggleLocale('en')} sx={{ fontSize: 14, fontWeight: 700 }}>🇺🇸 English</MenuItem>
            <MenuItem onClick={() => toggleLocale('fr')} sx={{ fontSize: 14, fontWeight: 700 }}>🇫🇷 Français</MenuItem>
          </Menu>

          {/* Perfil */}
          <button
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            className="hover:text-[var(--secondary)] transition-colors"
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
            className="hover:text-[var(--secondary)] transition-colors"
            onClick={(e) => setThemeAnchor(e.currentTarget)}
          >
            <ModeNightIcon fontSize="medium" />
          </button>
          <Menu
            anchorEl={themeAnchor}
            open={Boolean(themeAnchor)}
            onClose={handleClose}
            slotProps={{ paper: { sx: { mt: 1, borderRadius: 2 } } }}
          >
            <MenuItem onClick={() => { setTheme('light');  handleClose(); }}>Luminoso</MenuItem>
            <MenuItem onClick={() => { setTheme('dark');   handleClose(); }}>Oscuro</MenuItem>
            <MenuItem onClick={() => { setTheme('system'); handleClose(); }}>Sistema</MenuItem>
          </Menu>

        </div>
      </div>
    </nav>
  );
}
