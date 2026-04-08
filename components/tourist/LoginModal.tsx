"use client";

import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >

      {/* Modal glassmorphism */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.18)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.30)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1 z-10"
        >
          <CloseIcon fontSize="small" />
        </button>

        <div className="px-8 pt-10 pb-8">
          {/* Título */}
          <h2
            className="text-3xl font-bold text-white text-center mb-8 tracking-wide"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
          >
            Login
          </h2>

          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/80 pl-1">Email</label>
              <input
                type="email"
                placeholder="username@gmail.com"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/90 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/60 transition-all"
                style={{ border: 'none' }}
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/80 pl-1">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/90 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/60 transition-all"
                style={{ border: 'none' }}
              />
            </div>

            {/* Forgot password */}
            <div className="flex justify-start pl-1">
              <a href="#" className="text-xs text-white/70 hover:text-white transition-colors hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Botón Sign in */}
            <button
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] mt-2"
              style={{
                background: '#1a3461',
                boxShadow: '0 4px 15px rgba(26, 52, 97, 0.4)',
              }}
            >
              Sign in
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/25" />
            <span className="text-xs text-white/60 whitespace-nowrap">or continue with</span>
            <div className="flex-1 h-px bg-white/25" />
          </div>

          {/* Social buttons */}
          <div className="flex">
            {/* Google */}
            <button
              className="flex-1 flex items-center justify-center py-3 rounded-xl bg-white/90 hover:bg-white transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
          </div>

          {/* Registro */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/60">
              Don't have an account yet?{' '}
              <button className="text-green-400 font-bold hover:text-green-300 hover:underline transition-colors">
                Register for free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

