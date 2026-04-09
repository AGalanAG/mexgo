'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { saveSession } from '@/lib/client-auth';
import { DEMO_TOKEN, DEMO_USER_ID, DEMO_BUSINESS_NAME, DEMO_TOURIST_NAME, DEMO_ITINERARY_STOPS, DEMO_CHAT_HISTORY, DEMO_RECOMMENDATIONS } from '@/constants/demo-data';
import { Store as StoreIcon, ExploreOutlined as TouristIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';

export default function DemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function entrarComoTurista() {
    setLoading(true);
    saveSession({
      accessToken:  DEMO_TOKEN,
      refreshToken: DEMO_TOKEN,
      primaryRole:  'TURISTA',
      roleCodes:    ['TURISTA'],
      user: {
        id:    DEMO_USER_ID,
        email: 'demo-turista@mexgo.mx',
      },
    });
    localStorage.setItem('mexgo_tourist_profile', JSON.stringify({
      fullName:        DEMO_TOURIST_NAME,
      countryOfOrigin: 'MX',
      accessibilityNeeds: [],
      travelMotives:   ['gastronomy', 'cultural'],
    }));
    localStorage.setItem('mexgo_itinerary', JSON.stringify(DEMO_ITINERARY_STOPS));
    localStorage.setItem('mexgo_chat_history', JSON.stringify(DEMO_CHAT_HISTORY));
    localStorage.setItem('mexgo_recommendations', JSON.stringify(DEMO_RECOMMENDATIONS));

    // Cookie para que proxy.ts reconozca el rol en modo demo
    document.cookie = `mexgo_primary_role=TURISTA; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`;

    router.push('/discover');
  }

  function entrarComoNegocio() {
    setLoading(true);
    saveSession({
      accessToken:  DEMO_TOKEN,
      refreshToken: DEMO_TOKEN,
      primaryRole:  'ENCARGADO_NEGOCIO',
      roleCodes:    ['ENCARGADO_NEGOCIO'],
      user: {
        id:    DEMO_USER_ID,
        email: 'demo@mexgo.mx',
      },
    });
    // Cookie para que proxy.ts permita acceso a /business/*
    document.cookie = `mexgo_primary_role=ENCARGADO_NEGOCIO; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`;
    router.push('/business/dashboard');
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(150deg, #0a0f1e 0%, var(--dark-blue) 60%, #0d2a10 100%)' }}
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <span className="font-black text-4xl text-white tracking-tight">
          Mex<span style={{ color: 'var(--secondary)' }}>GO</span>
        </span>
        <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mt-1">
          Modo demo
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-black text-gray-900">Acceso de demostración</h1>
          <p className="text-sm text-gray-400">
            Explora MexGO Negocios sin necesitar cuenta
          </p>
        </div>

        <button
          onClick={entrarComoTurista}
          disabled={loading}
          className="w-full flex items-center justify-between gap-3 bg-[var(--primary)] hover:bg-[var(--dark-blue)] disabled:opacity-60 text-white font-black px-6 py-4 rounded-2xl transition-all shadow-lg shadow-[var(--primary)]/25 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <TouristIcon sx={{ fontSize: 20 }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black leading-tight">Entrar como turista</p>
              <p className="text-[11px] font-medium text-white/70 leading-tight">{DEMO_TOURIST_NAME}</p>
            </div>
          </div>
          <ArrowIcon sx={{ fontSize: 20 }} className="shrink-0 opacity-70" />
        </button>

        <button
          onClick={entrarComoNegocio}
          disabled={loading}
          className="w-full flex items-center justify-between gap-3 bg-[var(--accent)] hover:bg-[var(--dark-green)] disabled:opacity-60 text-white font-black px-6 py-4 rounded-2xl transition-all shadow-lg shadow-[var(--accent)]/25 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <StoreIcon sx={{ fontSize: 20 }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black leading-tight">Entrar como negocio</p>
              <p className="text-[11px] font-medium text-white/70 leading-tight">{DEMO_BUSINESS_NAME}</p>
            </div>
          </div>
          <ArrowIcon sx={{ fontSize: 20 }} className="shrink-0 opacity-70" />
        </button>

        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          Los datos mostrados son de ejemplo.
          <br />Sin conexión a base de datos real.
        </p>
      </div>
    </div>
  );
}
