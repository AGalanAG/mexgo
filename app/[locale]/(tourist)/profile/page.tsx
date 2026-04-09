'use client';

import React, { useState } from 'react';
import Navbar from '@/components/tourist/Navbar';
import Footer from '@/components/tourist/Footer';
import {
  Edit as EditIcon,
  LocationOn as LocationOnIcon,
  Flight as FlightIcon,
  Favorite as FavoriteIcon,
  CalendarToday as CalendarTodayIcon,
  Star as StarIcon,
  CameraAlt as CameraAltIcon,
} from '@mui/icons-material';
import { clearSession, getStoredAccessToken } from '@/lib/client-auth';
import { DEMO_TOKEN, DEMO_TOURIST_NAME } from '@/constants/demo-data';

const MOCK_TRIPS = [
  {
    id: 1,
    title: 'CDMX Cultural',
    date: 'Mar 2026',
    stops: 4,
    image: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?q=80&w=800&auto=format&fit=crop',
    rating: 5,
  },
  {
    id: 2,
    title: 'Teotihuacán & Norte',
    date: 'Feb 2026',
    stops: 3,
    image: 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?q=80&w=800&auto=format&fit=crop',
    rating: 4,
  },
  {
    id: 3,
    title: 'Xochimilco & Sur',
    date: 'Ene 2026',
    stops: 5,
    image: 'https://images.unsplash.com/photo-1518105779142-d975b22f1b0a?q=80&w=800&auto=format&fit=crop',
    rating: 5,
  },
];

const PREFERENCES = [
  'Turismo Cultural', 'Gastronomía', 'Vida nocturna', 'Museos',
];

const STATS = [
  { label: 'Viajes', value: '3', icon: <FlightIcon sx={{ fontSize: 20 }} /> },
  { label: 'Favoritos', value: '12', icon: <FavoriteIcon sx={{ fontSize: 20 }} /> },
  { label: 'Días', value: '14', icon: <CalendarTodayIcon sx={{ fontSize: 20 }} /> },
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('Viajero MexGO');
  const [origin, setOrigin] = useState('MX');
  const [bio, setBio] = useState('Perfil de viajero en MexGo.');

  React.useEffect(() => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
      window.location.assign('/es');
      return;
    }

    const loadProfile = async () => {
      // Modo demo: no llamar a la API
      if (accessToken === DEMO_TOKEN) {
        setName(DEMO_TOURIST_NAME);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/tourist/profile', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const result = await response.json();
        if (!response.ok || !result?.ok) {
          throw new Error(result?.error?.message || 'No fue posible cargar perfil');
        }

        setName(result.data.fullName || 'Viajero MexGO');
        setOrigin(result.data.countryOfOrigin || 'MX');
        setBio('Perfil de viajero en MexGo.');
      } catch {
        clearSession();
        window.location.assign('/es');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleEditClick = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    const accessToken = getStoredAccessToken();
    if (!accessToken) {
      clearSession();
      window.location.assign('/es');
      return;
    }

    // Modo demo: solo cerrar edición sin llamar a la API
    if (accessToken === DEMO_TOKEN) {
      setIsEditing(false);
      return;
    }

    try {
      const response = await fetch('/api/tourist/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fullName: name,
          countryOfOrigin: origin,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error?.message || 'No fue posible guardar cambios');
      }

      setIsEditing(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar perfil');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--primary)] font-bold">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Navbar  />

      <main className="flex-1 pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* ── Hero Card ── */}
          <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
            {/* Banner */}
            <div
              className="h-40 w-full"
              style={{
                background: 'linear-gradient(135deg, var(--coppel-blue) 0%, var(--primary) 50%, var(--dark-blue) 100%)',
              }}
            >
              {/* decorative circles */}
              <div className="absolute top-4 right-6 w-24 h-24 rounded-full bg-[var(--secondary)]/20 blur-2xl" />
              <div className="absolute top-10 right-20 w-12 h-12 rounded-full bg-white/10" />
            </div>

            {/* Content below banner */}
            <div className="px-6 pb-6">
              {/* Avatar + Edit */}
              <div className="flex items-start justify-between -mt-14 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-[var(--coppel-yellow)] to-[var(--secondary)] flex items-center justify-center shadow-xl">
                    <span className="text-4xl font-black text-[var(--dark-blue)]">
                      {name.charAt(0)}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-[var(--coppel-blue)] text-white rounded-full flex items-center justify-center shadow-md hover:brightness-110 transition-all">
                    <CameraAltIcon sx={{ fontSize: 14 }} />
                  </button>
                </div>

                <div className="mt-[72px]">
                  <button
                    onClick={handleEditClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isEditing
                        ? 'bg-[var(--green)] text-white shadow-lg shadow-[var(--green)]/30'
                        : 'border-2 border-[var(--coppel-blue)] text-[var(--coppel-blue)] hover:bg-[var(--coppel-blue)]/5'
                    }`}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                    {isEditing ? 'Guardar' : 'Editar'}
                  </button>
                </div>
              </div>

              {/* Name & Origin */}
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xl font-black text-[var(--primary)] border-2 border-[var(--coppel-blue)]/30 rounded-xl px-3 py-2 outline-none focus:border-[var(--coppel-blue)] bg-gray-50"
                  />
                  <input
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full text-sm font-semibold text-gray-500 border-2 border-gray-100 rounded-xl px-3 py-2 outline-none focus:border-[var(--coppel-blue)] bg-gray-50"
                    placeholder="País de origen"
                  />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full text-sm text-gray-600 border-2 border-gray-100 rounded-xl px-3 py-2 outline-none focus:border-[var(--coppel-blue)] bg-gray-50 resize-none"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-black text-[var(--primary)] leading-tight">{name}</h1>
                  <p className="flex items-center gap-1 text-sm text-gray-400 font-semibold mt-1">
                    <LocationOnIcon sx={{ fontSize: 16 }} />
                    {origin}
                  </p>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">{bio}</p>
                </>
              )}
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-5 flex flex-col items-center gap-1 sm:gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--coppel-blue)]/10 text-[var(--coppel-blue)] flex items-center justify-center scale-90 sm:scale-100">
                  {s.icon}
                </div>
                <span className="text-xl sm:text-2xl font-black text-[var(--primary)]">{s.value}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] sm:tracking-widest text-center">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── Preferences ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
              Preferencias de viaje
            </h2>
            <div className="flex flex-wrap gap-2">
              {PREFERENCES.map((pref) => (
                <span
                  key={pref}
                  className="px-4 py-2 rounded-full text-sm font-bold bg-[var(--coppel-blue)]/8 text-[var(--coppel-blue)] border border-[var(--coppel-blue)]/20 hover:bg-[var(--coppel-blue)] hover:text-white transition-all cursor-default"
                >
                  {pref}
                </span>
              ))}
              <span className="px-4 py-2 rounded-full text-sm font-bold border-2 border-dashed border-gray-200 text-gray-400 hover:border-[var(--coppel-blue)] hover:text-[var(--coppel-blue)] transition-all cursor-pointer">
                + Añadir
              </span>
            </div>
          </div>

          

          {/* ── Mundial 2026 Badge ── */}
          <div
            className="rounded-3xl p-6 flex items-center gap-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--coppel-blue), var(--dark-blue))' }}
          >
            <div className="text-5xl">⚽</div>
            <div className="flex-1">
              <p className="text-white font-black text-lg leading-tight">Mundial 2026</p>
              <p className="text-white/60 text-sm mt-1">Listo para la experiencia del año. ¡Que empiece el partido!</p>
            </div>
            <div className="bg-[var(--secondary)] text-[var(--dark-blue)] font-black text-xs px-4 py-2 rounded-xl shadow-lg whitespace-nowrap">
              MexGO Ready
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
