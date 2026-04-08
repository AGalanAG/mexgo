"use client";

import React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ModeNightIcon from '@mui/icons-material/ModeNight';

export default function Navbar() {
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

      {/* Iconos MUI */}
      <div className="flex gap-5 items-center">
    
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