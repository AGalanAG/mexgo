'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/tourist/Navbar';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

import { motion, AnimatePresence } from 'framer-motion';
import MapboxMap, { MapMarker } from '@/components/tourist/MapboxMap';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing'; // Navegación i18n
import type { ItineraryStop } from '@/types/types';
import { MOCK_BUSINESSES } from '@/lib/businesses';

interface Stop {
  id: string;
  name: string;
  addr: string;
  lng: number;
  lat: number;
  businessProfileId?: string;
}

function toStop(s: ItineraryStop): Stop {
  const time = s.startTime ? ` · ${s.startTime}` : '';
  return {
    id: s.id,
    name: s.label,
    addr: `${s.routeDate}${time}`,
    lng: s.longitude,
    lat: s.latitude,
    businessProfileId: s.businessProfileId,
  };
}

const LS_KEY = 'mexgo_itinerary';

function saveToLS(stops: ItineraryStop[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(stops));
}

function loadFromLS(): Stop[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as ItineraryStop[]).map(toStop);
  } catch {
    return [];
  }
}

export default function TripsPage() {
  const t = useTranslations('Trips');
  const router = useRouter(); // router restaurado
  const [stops, setStops] = useState<Stop[]>([]);
  const [hasLocationPermission, setHasLocationPermission] = useState(true);

  useEffect(() => {
    setStops(loadFromLS());
    const perm = localStorage.getItem('mexgo_location_permission');
    if (perm === 'denied') setHasLocationPermission(false);
  }, []);

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newStops.length) {
      [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
      setStops(newStops);
      // Persistir reorden en localStorage
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const itinerary: ItineraryStop[] = JSON.parse(raw);
          const a = itinerary.findIndex(s => s.id === newStops[index].id);
          const b = itinerary.findIndex(s => s.id === newStops[targetIndex].id);
          if (a !== -1 && b !== -1) [itinerary[a], itinerary[b]] = [itinerary[b], itinerary[a]];
          saveToLS(itinerary);
        }
      } catch { /* ignore */ }
    }
  };

  const removeStop = (id: string) => {
    setStops(prev => prev.filter(s => s.id !== id));
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const itinerary: ItineraryStop[] = JSON.parse(raw);
        saveToLS(itinerary.filter(s => s.id !== id));
      }
    } catch { /* ignore */ }
  };

  const handleMarkerClick = (id: string) => {
    router.push(`/discover/${id}`);
  };

  const markers: MapMarker[] = [
    ...MOCK_BUSINESSES.map(b => {
      const stopIndex = stops.findIndex(s => s.businessProfileId === b.id);
      const isInItinerary = stopIndex !== -1;
      return {
        lng: b.longitude,
        lat: b.latitude,
        label: isInItinerary ? `${stopIndex + 1}. ${b.businessName}` : b.businessName,
        color: isInItinerary ? '#22c55e' : '#004891',
        businessProfileId: b.id,
        onClick: handleMarkerClick
      };
    }),
    ...stops
      .filter(s => !MOCK_BUSINESSES.some(b => b.id === s.businessProfileId))
      .map(s => ({
        lng: s.lng,
        lat: s.lat,
        label: `${stops.indexOf(s) + 1}. ${s.name}`,
        color: '#22c55e',
        businessProfileId: s.businessProfileId,
        onClick: handleMarkerClick
      }))
  ];

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">

        {/* Left Sidebar */}
        <section className="w-full lg:w-[450px] flex flex-col border-r border-gray-100 bg-surface shadow-xl z-10 overflow-hidden">
          <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-[var(--primary)] mb-1 uppercase tracking-tight">
                {t('title')}
              </h1>
              <div className="w-10 h-1 bg-[var(--secondary)] rounded-full mb-2" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                {t('subtitle')}
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-200 px-4 py-3 focus-within:ring-2 focus-within:ring-[var(--primary)] transition-all group">
                <SearchIcon className="text-gray-300 group-focus-within:text-[var(--primary)] mr-3 transition-colors" fontSize="small" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-gray-400 font-bold"
                />
              </div>
            </div>

            {/* Date Selector */}
            <div className="mb-10">
              <label className="block text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3">{t('dateLabel')}</label>
              <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus-within:border-[var(--primary)] focus-within:bg-surface transition-all shadow-sm">
                <input
                  type="date"
                  defaultValue="2026-08-17"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--primary)] font-black uppercase tracking-tight"
                />
                <CalendarTodayIcon className="text-[var(--secondary)]" fontSize="small" />
              </div>
            </div>

            {/* Selected Stops */}
            <div>
              <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                {t('selectedStops')}
                <span className="flex-1 h-[1px] bg-[var(--secondary)]/40"></span>
              </h4>

              <div className="space-y-4 pb-20">
                <AnimatePresence mode="popLayout">
                  {stops.map((stop, index) => (
                    <motion.div
                      layout
                      key={stop.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-4 bg-surface p-5 rounded-[1.5rem] shadow-sm border border-gray-100 hover:border-[var(--primary)] transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[var(--primary)]/20 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-[var(--primary)] truncate leading-tight mb-1">{stop.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{stop.addr}</p>
                      </div>

                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveStop(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-300 hover:text-[var(--primary)] disabled:opacity-10"
                        >
                          <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                        </button>
                        <button
                          onClick={() => moveStop(index, 'down')}
                          disabled={index === stops.length - 1}
                          className="text-gray-300 hover:text-[var(--primary)] disabled:opacity-10"
                        >
                          <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeStop(stop.id)}
                        className="text-gray-200 hover:text-red-500 transition-colors ml-2"
                      >
                        <CloseIcon sx={{ fontSize: 20 }} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {stops.length === 0 && (
                  <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{t('noStops')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Map - FILLS FULL SPACE */}
        <section className="flex-1 relative">
          <MapboxMap
            center={[-99.1620, 19.4280]}
            zoom={12.5}
            markers={markers}
            className="w-full h-full"
          />
        </section>
      </main>

    </div>
  );
}
