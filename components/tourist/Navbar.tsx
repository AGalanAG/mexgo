"use client";

import Link from 'next/link';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ModeNightIcon from '@mui/icons-material/ModeNight';

interface NavbarProps {
  variant?: 'dark' | 'light';
}

export default function Navbar({ variant = 'dark' }: NavbarProps) {
  const isLight = variant === 'light';

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
        <Link href="#" className="hover:opacity-70 transition-opacity">Trips</Link>
        <Link href="#" className="hover:opacity-70 transition-opacity">More</Link>
      </div>

      {/* Iconos MUI */}
      <div className="flex gap-5 items-center">
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