"use client";

<<<<<<< HEAD
import React, { useState } from 'react';
=======
import Link from 'next/link';
>>>>>>> origin/feat/turista
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import LanguageIcon from '@mui/icons-material/Language';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from 'next-themes';

<<<<<<< HEAD
export default function Navbar() {
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);
  const { setTheme } = useTheme();

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
=======
interface NavbarProps {
  variant?: 'dark' | 'light';
}

export default function Navbar({ variant = 'dark' }: NavbarProps) {
  const isLight = variant === 'light';
>>>>>>> origin/feat/turista

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
        <Link href="/discover" className="hover:opacity-70 transition-opacity">Discover</Link>
        <Link href="/trips" className="hover:opacity-70 transition-opacity">Trips</Link>
        <Link href="#" className="hover:opacity-70 transition-opacity">More</Link>
      </div>

      {/* Iconos MUI */}
      <div className="flex gap-5 items-center">
        <button className="hover:opacity-70 transition-opacity">
          <AccountCircleIcon fontSize="medium" />
        </button>
<<<<<<< HEAD
        
        {/* Idioma */}
        <button 
          className="hover:text-gray-300 transition-colors"
          onClick={handleLangClick}
        >
          <LanguageIcon fontSize="medium" />
        </button>
        <Menu
          anchorEl={langAnchor}
          open={Boolean(langAnchor)}
          onClose={handleClose}
          className="mt-2"
        >
          <MenuItem onClick={handleClose}>Español</MenuItem>
          <MenuItem onClick={handleClose}>Inglés</MenuItem>
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
=======
        {!isLight && (
          <button className="hover:opacity-70 transition-opacity">
            <ModeNightIcon fontSize="medium" />
          </button>
        )}
>>>>>>> origin/feat/turista
      </div>
    </nav>
  );
}
