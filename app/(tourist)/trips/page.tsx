'use client';

import React from 'react';
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
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { motion } from 'framer-motion';

export default function TripsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* 1. Navbar fija */}
      <Navbar variant="light" />

      {/* Main Content: Padding-top for fixed Navbar */}
      <main className="pt-20 pb-24 flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full overflow-hidden">
        
        {/* Left Sidebar: Settings and Stops (1024px+ side layout) */}
        <section className="flex-1 lg:max-w-md w-full p-4 md:p-6 overflow-y-auto no-scrollbar">
          
          {/* 2. Header de página */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-[var(--primary)] mb-1 uppercase tracking-tight" style={{ fontFamily: 'var(--font-display, inherit)' }}>
              My Personalized Route
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Select locations on the map to create your route
            </p>
          </div>

          {/* 3. Barra de búsqueda */}
          <div className="mb-6">
            <div className="relative flex items-center bg-gray-100 rounded-full border border-gray-200 px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)] transition-all">
              <SearchIcon className="text-gray-400 mr-2" fontSize="small" />
              <input 
                type="text" 
                placeholder="Search for places on the map..." 
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-gray-400 font-medium"
              />
              <div className="flex items-center gap-2 border-l border-gray-300 ml-2 pl-2">
                <LayersIcon className="text-gray-400 cursor-pointer hover:text-gray-600" fontSize="small" />
                <SettingsIcon className="text-gray-400 cursor-pointer hover:text-gray-600" fontSize="small" />
              </div>
            </div>
          </div>

          {/* 4. Selector de modo de transporte */}
          <div className="mb-6">
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--accent)] text-white shadow-sm transition-all text-xs font-bold uppercase tracking-wider">
                <DirectionsWalkIcon fontSize="small" /> Walking
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-all text-xs font-bold uppercase tracking-wider">
                <DirectionsBikeIcon fontSize="small" /> Bicycle
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-all text-xs font-bold uppercase tracking-wider">
                <DirectionsCarIcon fontSize="small" /> Car
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-all text-xs font-bold uppercase tracking-wider">
                <DirectionsBusIcon fontSize="small" /> Transit
              </button>
            </div>
          </div>

          {/* 7. Selector de fecha */}
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

          {/* 8. Sección "Selected Stops" */}
          <div className="mb-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 border-b border-gray-100 pb-2">Selected Stops</h4>
            
            <div className="space-y-4">
              {[
                { n: 1, name: "National Museum of Anthropology", addr: "Av. Paseo de la Reforma, CDMX" },
                { n: 2, name: "Chapultepec Castle", addr: "Bosque de Chapultepec, CDMX" },
                { n: 3, name: "Palace of Bellas Artes", addr: "Centro Histórico, CDMX" },
              ].map((stop) => (
                <div key={stop.n} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[var(--primary)] transition-all group">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {stop.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-[var(--primary)] truncate">{stop.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate">{stop.addr}</p>
                  </div>
                  <DragHandleIcon className="text-gray-300 cursor-grab group-hover:text-gray-500" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Section: Map Placeholder (1024px+ side layout) */}
        <section className="flex-1 h-[400px] lg:h-full p-4 lg:p-6 lg:pl-0">
          {/* 5. Mapa placeholder */}
          <div className="w-full h-full bg-gray-200 rounded-[var(--radius-xl)] relative overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center">
            {/* Visual background for map mock */}
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-99.1620,19.4194,13,0/800x600?access_token=none')] bg-cover opacity-60"></div>
            
            <span className="relative z-10 text-gray-500 font-black uppercase tracking-[0.3em] text-sm bg-white/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/50">
              Interactive Map
            </span>

            {/* 6. Popup de lugar sobre el mapa (estático preview) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] z-20">
              <div className="bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 min-w-[280px] relative">
                <button className="absolute top-3 right-3 text-gray-300 hover:text-gray-600">
                  <CloseIcon fontSize="small" />
                </button>
                <div className="mb-4">
                  <h5 className="font-black text-[var(--primary)] text-base mb-0.5">Zócalo</h5>
                  <p className="text-[10px] text-gray-400 font-bold uppercase leading-tight">Plaza de la Constitución, Centro Histórico, CDMX</p>
                </div>
                <button className="w-full bg-[var(--primary)] text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-widest shadow-md hover:brightness-110 transition-all">
                  + Add to my route
                </button>
                {/* Pointer arrow for the popup */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Barra inferior de resumen */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 md:p-6 z-40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-10">
          <div className="flex gap-10">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Distance</p>
              <p className="text-xl font-black text-[var(--primary)]">7.2 km</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Time</p>
              <p className="text-xl font-black text-[var(--primary)]">1h 45min</p>
            </div>
          </div>
          <button className="flex-1 w-full bg-[var(--accent)] text-white font-black py-4 rounded-2xl shadow-lg shadow-[var(--accent)]/20 text-sm uppercase tracking-[0.2em] hover:brightness-110 transition-all active:scale-[0.98]">
            ✓ Finalize & Save Route
          </button>
        </div>
      </footer>

      {/* 10. Botón flotante de chat */}
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
