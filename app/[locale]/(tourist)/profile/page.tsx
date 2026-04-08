'use client';

import React, { useState } from 'react';
import Navbar from '@/components/tourist/Navbar';
import Footer from '@/components/tourist/Footer';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Edit as EditIcon,
  LocationOn as LocationOnIcon,
  Flight as FlightIcon,
  Favorite as FavoriteIcon,
  CalendarToday as CalendarTodayIcon,
  Star as StarIcon,
  CameraAlt as CameraAltIcon,
} from '@mui/icons-material';

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

export default function ProfilePage() {
  const t = useTranslations('Profile');

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(t('defaultName'));
  const [origin, setOrigin] = useState(t('defaultOrigin'));
  const [bio, setBio] = useState(t('defaultBio'));

  const preferences = t.raw('preferences.items') as string[];

  const STATS = [
    { labelKey: 'stats.trips',     value: '3',  icon: <FlightIcon sx={{ fontSize: 20 }} /> },
    { labelKey: 'stats.favorites', value: '12', icon: <FavoriteIcon sx={{ fontSize: 20 }} /> },
    { labelKey: 'stats.days',      value: '14', icon: <CalendarTodayIcon sx={{ fontSize: 20 }} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Navbar variant="light" />

      <main className="flex-1 pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* ── Hero Card ── */}
          <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
            {/* Banner */}
            <div
              className="h-40 w-full relative"
              style={{
                background: 'linear-gradient(135deg, var(--coppel-blue) 0%, var(--primary) 50%, var(--dark-blue) 100%)',
              }}
            >
              <div className="absolute top-4 right-6 w-24 h-24 rounded-full bg-[var(--secondary)]/20 blur-2xl" />
              <div className="absolute top-10 right-20 w-12 h-12 rounded-full bg-white/10" />
            </div>

            {/* Content below banner */}
            <div className="px-6 pb-6">
              {/* Avatar + Edit */}
              <div className="flex items-end justify-between -mt-14 mb-4">
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

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isEditing
                      ? 'bg-[var(--green)] text-white shadow-lg shadow-[var(--green)]/30'
                      : 'border-2 border-[var(--coppel-blue)] text-[var(--coppel-blue)] hover:bg-[var(--coppel-blue)]/5'
                  }`}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                  {isEditing ? t('save') : t('edit')}
                </button>
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
                    placeholder={t('originPlaceholder')}
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
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div
                key={s.labelKey}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--coppel-blue)]/10 text-[var(--coppel-blue)] flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="text-2xl font-black text-[var(--primary)]">{s.value}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t(s.labelKey)}
                </span>
              </div>
            ))}
          </div>

          {/* ── Preferences ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
              {t('preferences.title')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {preferences.map((pref) => (
                <span
                  key={pref}
                  className="px-4 py-2 rounded-full text-sm font-bold bg-[var(--coppel-blue)]/8 text-[var(--coppel-blue)] border border-[var(--coppel-blue)]/20 hover:bg-[var(--coppel-blue)] hover:text-white transition-all cursor-default"
                >
                  {pref}
                </span>
              ))}
              <span className="px-4 py-2 rounded-full text-sm font-bold border-2 border-dashed border-gray-200 text-gray-400 hover:border-[var(--coppel-blue)] hover:text-[var(--coppel-blue)] transition-all cursor-pointer">
                {t('preferences.add')}
              </span>
            </div>
          </div>

          {/* ── Recent Trips ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                {t('itineraries.title')}
              </h2>
              <Link href="/trips" className="text-xs font-bold text-[var(--coppel-blue)] hover:underline">
                {t('itineraries.viewAll')}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MOCK_TRIPS.map((trip) => (
                <div
                  key={trip.id}
                  className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="relative h-32 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-3 text-white">
                      <p className="font-black text-sm leading-tight">{trip.title}</p>
                      <p className="text-[10px] text-white/70 font-medium">
                        {trip.date} · {trip.stops} {t('itineraries.stops')}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        sx={{ fontSize: 12 }}
                        className={i < trip.rating ? 'text-[var(--secondary)]' : 'text-gray-200'}
                      />
                    ))}
                    <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {trip.rating}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Mundial 2026 Badge ── */}
          <div
            className="rounded-3xl p-6 flex items-center gap-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--coppel-blue), var(--dark-blue))' }}
          >
            <div className="text-5xl">⚽</div>
            <div className="flex-1">
              <p className="text-white font-black text-lg leading-tight">{t('mundial.title')}</p>
              <p className="text-white/60 text-sm mt-1">{t('mundial.subtitle')}</p>
            </div>
            <div className="bg-[var(--secondary)] text-[var(--dark-blue)] font-black text-xs px-4 py-2 rounded-xl shadow-lg whitespace-nowrap">
              {t('mundial.badge')}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

