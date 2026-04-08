'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/tourist/Navbar';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { NegocioConScore } from '@/types/types';

interface DisplayPlace {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  location: string;
  lng: number;
  lat: number;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80';

function toDisplay(n: NegocioConScore): DisplayPlace {
  return {
    id: n.id,
    name: n.businessName,
    imageUrl: n.coverImageUrl || FALLBACK_IMAGE,
    description: n.businessDescription,
    location: `${n.neighborhood}, ${n.boroughCode}`,
    lng: n.longitude,
    lat: n.latitude,
  };
}

export default function DiscoverPage() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [places, setPlaces] = useState<DisplayPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Discover');

  useEffect(() => {
    const stored = localStorage.getItem('mexgo_recommendations');
    
    const handleData = (data: NegocioConScore[]) => {
      const mapped = data.map(toDisplay);
      // Agregamos 2 cards extras para mejorar la simetría como pidió el usuario
      const extras: DisplayPlace[] = [
        {
          id: 'extra-1',
          name: 'Mercado de Antojitos',
          imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
          description: 'Una explosión de sabores tradicionales en el corazón de la ciudad. Perfecto para probar de todo un poco.',
          location: 'Coyoacán, CDMX',
          lng: -99.1633,
          lat: 19.3467
        },
        {
          id: 'extra-2',
          name: 'Café de la Esquina',
          imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
          description: 'El aroma del café recién tostado y pan dulce artesanal. Un refugio acogedor para iniciar el día.',
          location: 'Roma Norte, CDMX',
          lng: -99.1611,
          lat: 19.4122
        }
      ];
      setPlaces([...mapped, ...extras]);
      setLoading(false);
    };

    if (stored) {
      handleData(JSON.parse(stored));
    } else {
      fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: 19.4326, lng: -99.1332 }),
      })
        .then(r => r.json())
        .then(res => {
          if (res.ok && res.data) {
            localStorage.setItem('mexgo_recommendations', JSON.stringify(res.data));
            handleData(res.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  const clearSearch = (): void => setSearchValue('');

  const handleCardClick = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    setFlippedId(flippedId === id ? null : id);
  };

  const filtered = places.filter(p =>
    !searchValue ||
    p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    p.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] overflow-x-hidden">
      <Navbar variant="light" />

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto w-full flex-1 flex flex-col items-center">
        {/* Header section centered */}
        <div className="w-full max-w-3xl text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--primary)] mb-4 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs mb-8">
            {t('recommendations')}
          </p>

          {/* Centered Search bar */}
          <div className="relative flex items-center bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden px-6 py-4 shadow-xl shadow-gray-200/50 transition-all focus-within:ring-4 focus-within:ring-[var(--primary)]/5 focus-within:border-[var(--primary)] w-full">
            <SearchIcon className="text-gray-300 mr-3" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] font-bold placeholder-gray-300 text-lg"
            />
            {searchValue && (
              <button onClick={clearSearch} className="p-2 text-gray-400 hover:text-[var(--primary)] transition-colors">
                <CloseIcon fontSize="small" />
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-[var(--primary)] text-xs font-black uppercase tracking-[0.3em]">Buscando tesoros locales...</p>
          </div>
        )}

        {/* Cards grid centered and with aspect-square */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full justify-items-center">
          {filtered.map((place) => (
            <div
              key={place.id}
              className="perspective-1000 cursor-pointer aspect-square w-full max-w-[320px] group"
              onClick={(e) => handleCardClick(e, place.id)}
            >
              <motion.div
                className="relative w-full h-full transition-all duration-500 preserve-3d"
                animate={{ rotateY: flippedId === place.id ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 backface-hidden shadow-xl overflow-hidden flex flex-col justify-end p-6 group-hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]"
                  style={{
                    borderRadius: '2.5rem',
                    backgroundImage: `url(${place.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80" />
                  <div className="relative z-10">
                    <span className="text-[10px] text-[var(--secondary)] font-black uppercase tracking-[0.2em] mb-2 block">
                      {place.location}
                    </span>
                    <h3 className="text-white text-2xl font-black leading-tight">
                      {place.name}
                    </h3>
                  </div>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 backface-hidden bg-white shadow-2xl flex flex-col p-8 rotate-y-180 border border-gray-50 text-center items-center justify-center"
                  style={{ borderRadius: '2.5rem' }}
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-[var(--primary)] mb-2">{place.name}</h3>
                    <div className="h-1 w-12 bg-[var(--secondary)] rounded-full mx-auto"></div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed italic">
                    "{place.description}"
                  </p>
                  
                  <Link
                    href={`/discover/${place.id}`}
                    className="w-full text-center text-[10px] font-black py-4 bg-[var(--primary)] text-white rounded-2xl hover:bg-[var(--primary-dark)] transition-all shadow-lg shadow-[var(--primary)]/20 active:scale-95 uppercase tracking-[0.2em]"
                  >
                    {t('viewDetails')}
                  </Link>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] w-full max-w-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">No hay resultados para tu búsqueda</p>
          </div>
        )}

        <div className="mt-24 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'var(--primary)', color: 'white' }}
            whileTap={{ scale: 0.95 }}
            className="bg-transparent border-2 border-[var(--primary)] text-[var(--primary)] font-black py-5 px-16 rounded-2xl transition-all shadow-sm uppercase tracking-[0.3em] text-[10px]"
          >
            {t('seeMore')}
          </motion.button>
        </div>
      </main>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-10 right-10 w-16 h-16 bg-[var(--accent)] text-white rounded-full flex items-center justify-center shadow-2xl z-50 transition-all border-4 border-white"
      >
        <ChatBubbleIcon />
      </motion.button>
    </div>
  );
}
