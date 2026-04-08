'use client';

import React, { useState } from 'react';
import Navbar from '@/components/tourist/Navbar';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import GridViewIcon from '@mui/icons-material/GridView';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MapboxMap, { MapMarker } from '@/components/tourist/MapboxMap';

interface StaticPlace {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  location: string;
  lng: number;
  lat: number;
}

const RECOMMENDED_PLACES: StaticPlace[] = [
  {
    id: '1',
    name: 'Sabores de Antaño',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    description: 'Authentic traditional cuisine with recipes passed down through generations.',
    location: 'Colonia Roma, CDMX',
    lng: -99.1650,
    lat: 19.4200,
  },
  {
    id: '2',
    name: 'El Rincón del Arte',
    imageUrl: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=600&q=80',
    description: 'A cozy gallery showcasing local contemporary artists and handmade crafts.',
    location: 'Coyoacán, CDMX',
    lng: -99.1624,
    lat: 19.3508,
  },
  {
    id: '3',
    name: 'Café Luna Nueva',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    description: 'Specialty coffee from organic beans harvested in Veracruz and Oaxaca.',
    location: 'Condesa, CDMX',
    lng: -99.1770,
    lat: 19.4130,
  },
  {
    id: '4',
    name: 'Textiles del Sur',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',
    description: 'Hand-woven garments and accessories using ancient natural dyeing techniques.',
    location: 'San Ángel, CDMX',
    lng: -99.1930,
    lat: 19.3444,
  },
];

export default function DiscoverPage() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const clearSearch = (): void => setSearchValue('');

  const handleCardClick = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    setFlippedId(flippedId === id ? null : id);
  };

  const filtered = searchValue
    ? RECOMMENDED_PLACES.filter(
        (p) =>
          p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          p.location.toLowerCase().includes(searchValue.toLowerCase())
      )
    : RECOMMENDED_PLACES;

  const markers: MapMarker[] = RECOMMENDED_PLACES.map((p) => ({
    lng: p.lng,
    lat: p.lat,
    label: p.name,
    color: '#004891',
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] overflow-x-hidden">
      <Navbar variant="light" />

      <main className="pt-20 flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full">

        {/* Left panel: search + cards */}
        <section className="flex-1 lg:max-w-xl overflow-y-auto no-scrollbar px-4 py-6">

          {/* Header + view toggle */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">
              Discover
            </h2>
            <button
              onClick={() => setShowMap((v) => !v)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary)] text-white text-xs font-bold shadow"
            >
              {showMap ? <GridViewIcon sx={{ fontSize: 16 }} /> : <MapIcon sx={{ fontSize: 16 }} />}
              {showMap ? 'Grid' : 'Map'}
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex items-center bg-gray-100 rounded-full border border-gray-200 overflow-hidden px-4 py-3 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:bg-white mb-8">
            <button onClick={clearSearch} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <CloseIcon fontSize="small" />
            </button>
            <input
              type="text"
              placeholder="Search places..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-3 text-[var(--text-primary)] font-medium placeholder-gray-400"
            />
            <SearchIcon className="text-gray-400" />
          </div>

          {/* Mobile map panel */}
          {showMap && (
            <div className="lg:hidden w-full h-72 rounded-2xl overflow-hidden border border-gray-100 shadow-inner mb-8">
              <MapboxMap center={[-99.1620, 19.3900]} zoom={11} markers={markers} className="w-full h-full" />
            </div>
          )}

          {/* Cards grid */}
          <h3 className="text-lg font-semibold text-[var(--primary)] mb-4">Recommendations</h3>
          <div className="grid grid-cols-2 gap-4 w-full">
            {filtered.map((place) => (
              <div
                key={place.id}
                className="perspective-1000 cursor-pointer aspect-square"
                onClick={(e) => handleCardClick(e, place.id)}
              >
                <motion.div
                  className="relative w-full h-full transition-all duration-500 preserve-3d"
                  animate={{ rotateY: flippedId === place.id ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 backface-hidden shadow-md flex flex-col justify-end p-3"
                    style={{
                      borderRadius: '1.5rem',
                      backgroundImage: `url(${place.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20 rounded-[1.5rem]" />
                    <div className="relative z-10">
                      <Link
                        href={`/discover/${place.id}`}
                        className="inline-block text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-bold shadow-md hover:scale-105 transition-transform active:scale-95"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        {place.name}
                      </Link>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 backface-hidden bg-white shadow-md flex flex-col p-4 rotate-y-180 text-center"
                    style={{ borderRadius: '1.5rem' }}
                  >
                    <h3 className="text-sm font-bold text-[var(--primary)] mb-1 truncate">{place.name}</h3>
                    <p className="text-[10px] text-gray-500 mb-2 flex-1 overflow-hidden leading-tight">{place.description}</p>
                    <Link
                      href={`/discover/${place.id}`}
                      className="mt-auto text-[10px] font-bold py-2 bg-[var(--primary)] text-white rounded-lg hover:brightness-110"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-sm px-10"
            >
              See more
            </motion.button>
          </div>
        </section>

        {/* Right panel: sticky map (desktop only) */}
        <section className="hidden lg:flex flex-1 sticky top-0 h-screen p-6 pl-0">
          <div className="w-full h-full rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-inner">
            <MapboxMap
              center={[-99.1620, 19.3900]}
              zoom={11}
              markers={markers}
              className="w-full h-full"
            />
          </div>
        </section>
      </main>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
