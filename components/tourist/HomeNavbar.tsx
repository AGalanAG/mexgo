"use client";
import React, { useState } from 'react';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import LanguageIcon from '@mui/icons-material/Language';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from 'next-themes';
import { useLogin } from '@/context/LoginContext'; // <-- Importamos el contexto

export default function HomeNavbar() {
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);
  
  const { setTheme } = useTheme();
  const { openLogin } = useLogin(); // <-- Extraemos la función para abrir el modal

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

  return (
    <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center text-white z-50 max-w-7xl mx-auto left-1/2 -translate-x-1/2">
      {/* Logo */}
      <div className="font-bold text-2xl leading-tight cursor-pointer">
        Mex<br />GO
      </div>

      {/* Menú Central */}
      <div className="hidden md:flex gap-8 font-medium">
        <a href="#" className="hover:text-gray-300 transition-colors">Discover</a>
        <a href="#" className="hover:text-gray-300 transition-colors">Trips</a>
        <a href="#" className="hover:text-gray-300 transition-colors">More</a>
      </div>

      {/* Iconos y Botones */}
      <div className="flex gap-5 items-center">
        {/* Aquí conectamos el onClick al contexto */}
        <button 
          onClick={openLogin}
          className="text-sm font-medium hover:text-gray-300 transition-colors"
        >
          Inicio de sesión
        </button>
        <button className="text-sm font-medium hover:text-gray-300 transition-colors">
          Registro
        </button>

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
      </div>
    </nav>
  );
}