'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/tourist/Navbar';
// Importación agrupada de Iconos (ESM Friendly)
import {
  Search as SearchIcon,
  Layers as LayersIcon,
  Settings as SettingsIcon,
  DirectionsWalk as DirectionsWalkIcon,
  DirectionsBike as DirectionsBikeIcon,
  DirectionsCar as DirectionsCarIcon,
  DirectionsBus as DirectionsBusIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

import { motion, AnimatePresence } from 'framer-motion';
import MapboxMap, { MapMarker } from '@/components/tourist/MapboxMap';
import { useTranslations } from 'next-intl';
import type { ItineraryStop } from '@/types/types';

interface Stop {
  id: string;
  name: string;
  addr: string;
  lng: number;
  lat: number;
}

type TransportMode = 'walking' | 'bicycle' | 'car' | 'transit';

function toStop(s: ItineraryStop): Stop {
  const time = s.startTime ? ` · ${s.startTime}` : '';
  return {
    id: s.id,
    name: s.label,
    addr: `${s.routeDate}${time}`,
    lng: s.longitude,
    lat: s.latitude,
  };
}

const MOCK_STOPS: Stop[] = [
  {
    id: 'm1',
    name: 'Ángel de la Independencia',
    addr: 'Av. Paseo de la Reforma · 09:00 AM',
    lng: -99.1677,
    lat: 19.4270,
  },
  {
    id: 'm2',
    name: 'Museo Nacional de Antropología',
    addr: 'Bosque de Chapultepec · 11:30 AM',
    lng: -99.1863,
    lat: 19.4260,
  },
  {
    id: 'm3',
    name: 'Palacio de Bellas Artes',
    addr: 'Av. Juárez, Centro Histórico · 02:00 PM',
    lng: -99.1412,
    lat: 19.4352,
  },
  {
    id: 'm4',
    name: 'Zócalo de la CDMX',
    addr: 'Plaza de la Constitución · 04:30 PM',
    lng: -99.1332,
    lat: 19.4326,
  }
];

export default function TripsPage() {
  const t = useTranslations('Trips');
  const [transportMode, setTransportMode] = useState<TransportMode>('walking');
  const [stops, setStops] = useState<Stop[]>(MOCK_STOPS);

  useEffect(() => {
    fetch('/api/itinerary')
      .then(r => r.json())
      .then(res => {
        if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
          setStops(res.data.map(toStop));
        }
      })
      .catch(console.error);
  }, []);

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newStops.length) {
      const temp = newStops[index];
      newStops[index] = newStops[targetIndex];
      newStops[targetIndex] = temp;
      setStops(newStops);
    }
  };

  const removeStop = (id: string) => {
    setStops(prev => prev.filter(s => s.id !== id));
    fetch(`/api/itinerary/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const markers: MapMarker[] = stops
    .filter(s => s.lng !== 0 || s.lat !== 0)
    .map((s, i) => ({
      lng: s.lng,
      lat: s.lat,
      label: `${i + 1}. ${s.name}`,
      color: '#004891',
    }));

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <Navbar variant="light" />

      <main className="pt-16 flex-1 flex flex-col lg:flex-row w-full overflow-hidden">

        {/* Left Sidebar */}
        <section className="w-full lg:w-[450px] flex flex-col border-r border-gray-100 bg-white shadow-xl z-10 overflow-hidden">
          <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-[var(--primary)] mb-1 uppercase tracking-tight">
                {t('title')}
              </h1>
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

            {/* Transport Mode Selector */}
            <div className="mb-8">
              <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1.5">
                {[
                  { mode: 'walking', icon: <DirectionsWalkIcon fontSize="small" />, label: t('transport.walking') },
                  { mode: 'bicycle', icon: <DirectionsBikeIcon fontSize="small" />, label: t('transport.bicycle') },
                  { mode: 'car', icon: <DirectionsCarIcon fontSize="small" />, label: t('transport.car') },
                  { mode: 'transit', icon: <DirectionsBusIcon fontSize="small" />, label: t('transport.transit') },
                ].map((btn) => (
                  <button
                    key={btn.mode}
                    onClick={() => setTransportMode(btn.mode as TransportMode)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest ${
                      transportMode === btn.mode
                        ? 'bg-white text-[var(--primary)] shadow-md border border-gray-100'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {btn.icon} <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selector */}
            <div className="mb-10">
              <label className="block text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3">{t('dateLabel')}</label>
              <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus-within:border-[var(--primary)] focus-within:bg-white transition-all shadow-sm">
                <input
                  type="date"
                  defaultValue="2026-08-17"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--primary)] font-black uppercase tracking-tight"
                />
                <CalendarTodayIcon className="text-gray-300" fontSize="small" />
              </div>
            </div>

            {/* Selected Stops */}
            <div>
              <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                {t('selectedStops')}
                <span className="flex-1 h-[1px] bg-gray-100"></span>
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
                      className="flex items-center gap-4 bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 hover:border-[var(--primary)] transition-all group"
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

          {/* Sidebar Action Button */}
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <button className="w-full bg-[var(--primary)] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-[var(--primary)]/20 text-xs uppercase tracking-[0.3em] hover:brightness-110 hover:translate-y-[-2px] transition-all active:scale-[0.98]">
              {t('finalizeRoute')}
            </button>
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
          
          {/* Floating Stats */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-10 py-6 rounded-[2rem] shadow-2xl border border-white/50 flex gap-12 z-20">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('totalDistance')}</p>
              <p className="text-2xl font-black text-[var(--primary)]">{stops.length > 1 ? '7.2 km' : '0.0 km'}</p>
            </div>
            <div className="w-[1px] bg-gray-200 self-stretch"></div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('estimatedTime')}</p>
              <p className="text-2xl font-black text-[var(--primary)]">{stops.length > 1 ? '1h 45m' : '0m'}</p>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
