'use client';

import React, { useState } from 'react';
import Navbar from '@/components/tourist/Navbar';
import SearchIcon from '@mui/icons-material/Search';
import LayersIcon from '@mui/icons-material/Layers';
import SettingsIcon from '@mui/icons-material/Settings';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { motion, AnimatePresence } from 'framer-motion';
import MapboxMap, { MapMarker } from '@/components/tourist/MapboxMap';

interface Stop {
  id: string;
  name: string;
  addr: string;
  lng: number;
  lat: number;
}

type TransportMode = 'walking' | 'bicycle' | 'car' | 'transit';

export default function TripsPage() {
  const [transportMode, setTransportMode] = useState<TransportMode>('walking');
  const [stops, setStops] = useState<Stop[]>([
    { id: '1', name: "National Museum of Anthropology", addr: "Av. Paseo de la Reforma, CDMX", lng: -99.1865, lat: 19.4260 },
    { id: '2', name: "Chapultepec Castle", addr: "Bosque de Chapultepec, CDMX", lng: -99.1822, lat: 19.4202 },
    { id: '3', name: "Palace of Bellas Artes", addr: "Centro Histórico, CDMX", lng: -99.1412, lat: 19.4352 },
  ]);

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
    setStops(stops.filter(s => s.id !== id));
  };

  const transportButtons = [
    { mode: 'walking' as TransportMode, icon: <DirectionsWalkIcon fontSize="small" />, label: 'Walking' },
    { mode: 'bicycle' as TransportMode, icon: <DirectionsBikeIcon fontSize="small" />, label: 'Bicycle' },
    { mode: 'car' as TransportMode, icon: <DirectionsCarIcon fontSize="small" />, label: 'Car' },
    { mode: 'transit' as TransportMode, icon: <DirectionsBusIcon fontSize="small" />, label: 'Transit' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Navbar variant="light" />

      <main className="pt-20 pb-24 flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full overflow-hidden">
        
        {/* Left Sidebar */}
        <section className="flex-1 lg:max-w-md w-full p-4 md:p-6 overflow-y-auto no-scrollbar">
          
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-[var(--primary)] mb-1 uppercase tracking-tight">
              My Personalized Route
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Select locations on the map to create your route
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative flex items-center bg-gray-100 rounded-full border border-gray-200 px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)] transition-all">
              <SearchIcon className="text-gray-400 mr-2" fontSize="small" />
              <input 
                type="text" 
                placeholder="Search for places..." 
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-gray-400 font-medium"
              />
              <div className="flex items-center gap-2 border-l border-gray-300 ml-2 pl-2">
                <LayersIcon className="text-gray-400 cursor-pointer hover:text-gray-600" fontSize="small" />
                <SettingsIcon className="text-gray-400 cursor-pointer hover:text-gray-600" fontSize="small" />
              </div>
            </div>
          </div>

          {/* Transport Mode Selector */}
          <div className="mb-6">
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              {transportButtons.map((btn) => (
                <button 
                  key={btn.mode}
                  onClick={() => setTransportMode(btn.mode)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-wider ${
                    transportMode === btn.mode 
                      ? 'bg-[var(--accent)] text-white shadow-md' 
                      : 'text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {btn.icon} <span className="hidden sm:inline">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selector */}
          <div className="mb-8">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Date</label>
            <div className="relative flex items-center bg-white border border-gray-300 rounded-xl px-4 py-3 focus-within:border-[var(--primary)] transition-all">
              <input 
                type="date" 
                defaultValue="2026-08-17"
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] font-bold uppercase"
              />
              <CalendarTodayIcon className="text-gray-400 ml-2" fontSize="small" />
            </div>
          </div>

          {/* Selected Stops */}
          <div className="mb-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 border-b border-gray-100 pb-2">Selected Stops</h4>
            
            <div className="space-y-4">
              <AnimatePresence>
                {stops.map((stop, index) => (
                  <motion.div 
                    layout
                    key={stop.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[var(--primary)] transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-[var(--primary)] truncate">{stop.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate">{stop.addr}</p>
                    </div>
                    
                    {/* Reordering and Removal Controls */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => moveStop(index, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-[var(--primary)] disabled:opacity-20"
                      >
                        <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                      </button>
                      <button 
                        onClick={() => moveStop(index, 'down')}
                        disabled={index === stops.length - 1}
                        className="text-gray-400 hover:text-[var(--primary)] disabled:opacity-20"
                      >
                        <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeStop(stop.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors ml-1"
                    >
                      <CloseIcon sx={{ fontSize: 20 }} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {stops.length === 0 && (
                <p className="text-center text-gray-400 text-sm italic py-10">No stops selected. Add places from the map!</p>
              )}
            </div>
          </div>
        </section>

        {/* Right Section: Map */}
        <section className="flex-1 h-[400px] lg:h-full p-4 lg:p-6 lg:pl-0">
          <div className="w-full h-full rounded-[var(--radius-xl)] overflow-hidden border border-gray-100 shadow-inner">
            <MapboxMap
              center={[-99.1620, 19.4280]}
              zoom={12.5}
              markers={stops.map((s, i) => ({
                lng: s.lng,
                lat: s.lat,
                label: `${i + 1}. ${s.name}`,
                color: '#004891',
              } as MapMarker))}
              className="w-full h-full"
            />
          </div>
        </section>
      </main>

      {/* Summary Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 md:p-6 z-40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-10">
          <div className="flex gap-10">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Distance</p>
              <p className="text-xl font-black text-[var(--primary)]">{stops.length > 1 ? '7.2 km' : '0.0 km'}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Time</p>
              <p className="text-xl font-black text-[var(--primary)]">{stops.length > 1 ? '1h 45min' : '0 min'}</p>
            </div>
          </div>
          <button className="flex-1 w-full bg-[var(--accent)] text-white font-black py-4 rounded-2xl shadow-lg shadow-[var(--accent)]/20 text-sm uppercase tracking-[0.2em] hover:brightness-110 transition-all active:scale-[0.98]">
            ✓ Finalize & Save Route
          </button>
        </div>
      </footer>

      <motion.button 
        whileHover={{ scale: 1.1, rotate: -10 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-28 right-6 w-14 h-14 bg-[var(--accent)] text-white rounded-full flex items-center justify-center shadow-xl z-50 transition-all"
      >
        <ChatBubbleIcon />
      </motion.button>
    </div>
  );
}
