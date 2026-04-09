"use client";
import React, { useState } from 'react';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import LanguageIcon from '@mui/icons-material/Language';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
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

  const [langAnchor,    setLangAnchor]    = useState<null | HTMLElement>(null);
  const [themeAnchor,   setThemeAnchor]   = useState<null | HTMLElement>(null);
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);

  const handleClose = () => {
    setLangAnchor(null);
    setThemeAnchor(null);
    setAccountAnchor(null);
  };

  const toggleLocale = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
    handleClose();
  };

  return (
    <nav className="absolute top-0 left-0 w-full z-50 text-white">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center">

        {/* Logo — ocupa el lado izquierdo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="font-extrabold text-2xl cursor-pointer">
            Mex<span className="text-[var(--secondary)]">GO</span>
          </Link>
        </div>

        {/* Menú Central — centrado exacto */}
        <div className="hidden md:flex gap-8 font-medium">
          <Link href="/discover" className="hover:text-gray-300 transition-colors">{t('discover')}</Link>
          <Link href="/trips"    className="hover:text-gray-300 transition-colors">{t('trips')}</Link>
        </div>

        {/* Acciones — ocupa el lado derecho */}
        <div className="flex-1 flex justify-end gap-4 items-center">

          {/* ── Desktop: botones de texto ── */}
          <div className="hidden md:flex gap-4 items-center">
            <button
              onClick={openLogin}
              className="text-sm font-medium hover:text-gray-300 transition-colors"
            >
              {t('login')}
            </button>
            <button
              onClick={openRegister}
              className="text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/25 px-4 py-1.5 rounded-full transition-all"
            >
              {t('register')}
            </button>
          </div>

          {/* ── Mobile: ícono de cuenta que abre menú ── */}
          <button
            className="md:hidden p-1 hover:text-gray-300 transition-colors"
            onClick={(e) => setAccountAnchor(e.currentTarget)}
            aria-label="Cuenta"
          >
            <PersonOutlinedIcon fontSize="medium" />
          </button>
          <Menu
            anchorEl={accountAnchor}
            open={Boolean(accountAnchor)}
            onClose={handleClose}
            slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, minWidth: 180 } } }}
          >
            <MenuItem
              onClick={() => { handleClose(); openLogin(); }}
              sx={{ fontSize: 14, fontWeight: 700, gap: 1.5 }}
            >
              <LoginIcon fontSize="small" /> {t('login')}
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => { handleClose(); openRegister(); }}
              sx={{ fontSize: 14, fontWeight: 700, gap: 1.5 }}
            >
              <AppRegistrationIcon fontSize="small" /> {t('register')}
            </MenuItem>
          </Menu>

          {/* Idioma */}
          <button
            className="hover:text-gray-300 transition-colors flex items-center gap-1 uppercase text-sm font-bold"
            onClick={(e) => setLangAnchor(e.currentTarget)}
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

          {/* Dark Mode */}
          <button
            className="hover:text-gray-300 transition-colors"
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
            <MenuItem onClick={() => { setTheme('light');  handleClose(); }} sx={{ fontSize: 14 }}>Luminoso</MenuItem>
            <MenuItem onClick={() => { setTheme('dark');   handleClose(); }} sx={{ fontSize: 14 }}>Oscuro</MenuItem>
            <MenuItem onClick={() => { setTheme('system'); handleClose(); }} sx={{ fontSize: 14 }}>Sistema</MenuItem>
          </Menu>

        </div>
      </div>
    </nav>
  );
}
