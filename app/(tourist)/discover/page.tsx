'use client';

import React, { useState } from 'react';
import Navbar from '@/components/tourist/Navbar';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import Link from 'next/link';

/**
 * Interface for static place data
 */
interface StaticPlace {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  location: string;
}

/**
 * Static data for recommendations
 */
const RECOMMENDED_PLACES: StaticPlace[] = [
  {
    id: '1',
    name: 'Bellas Artes',
    imageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&q=80',
    description: 'The Palace of Fine Arts is a prominent cultural center in Mexico City.',
    location: 'Centro Histórico, CDMX'
  },
  {
    id: '2',
    name: 'Castillo de Chapultepec',
    imageUrl: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=600&q=80',
    description: 'A historic castle located on top of Chapultepec Hill with stunning views.',
    location: 'Bosque de Chapultepec, CDMX'
  },
  {
    id: '3',
    name: 'Xochimilco',
    imageUrl: 'https://images.unsplash.com/photo-1547995886-6dc09384c6e8?w=600&q=80',
    description: 'Famous for its canals and colorful trajinera boat rides.',
    location: 'Xochimilco, CDMX'
  },
  {
    id: '4',
    name: 'Coyoacán',
    imageUrl: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&q=80',
    description: 'A charming bohemian neighborhood, home to the Frida Kahlo Museum.',
    location: 'Coyoacán, CDMX'
  },
];

export default function DiscoverPage() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const clearSearch = (): void => setSearchValue('');

  const handleCardClick = (e: React.MouseEvent, id: string) => {
    // If clicking a link/button, don't flip
    if ((e.target as HTMLElement).closest('a, button')) return;
    setFlippedId(flippedId === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] overflow-x-hidden">
      {/* 1. Navbar fija arriba */}
      <Navbar variant="light" />

      <main className="pt-24 pb-16 px-4 flex flex-col items-center w-full max-w-5xl mx-auto">
        
        {/* 2. Barra de búsqueda */}
        <div className="w-full mb-10">
          <div className="relative flex items-center bg-gray-100 rounded-full border border-gray-200 overflow-hidden px-4 py-3 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:bg-white">
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
        </div>

        {/* 3. Sección "Recommendations" */}
        <section className="w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-[var(--primary)]" style={{ fontFamily: 'var(--font-display, inherit)' }}>
            Recommendations
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {RECOMMENDED_PLACES.map((place) => (
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
                  {/* Front Side */}
                  <div 
                    className="absolute inset-0 backface-hidden shadow-[var(--shadow-md)] flex flex-col justify-end p-3"
                    style={{ 
                      borderRadius: 'var(--radius-xl, 1.5rem)',
                      backgroundImage: `url(${place.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20 rounded-[var(--radius-xl)]"></div>
                    
                    <div className="relative z-10 flex flex-col items-start w-full">
                      <Link 
                        href={`/discover/${place.id}`}
                        className="inline-block text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-bold shadow-md hover:scale-105 transition-transform active:scale-95"
                        style={{ backgroundColor: 'var(--color-accent, var(--accent, #006341))' }}
                      >
                        {place.name}
                      </Link>
                    </div>
                  </div>

                  {/* Back Side (Info) */}
                  <div 
                    className="absolute inset-0 backface-hidden bg-white shadow-[var(--shadow-md)] flex flex-col p-4 rotate-y-180 text-center"
                    style={{ borderRadius: 'var(--radius-xl, 1.5rem)' }}
                  >
                    <h3 className="text-sm font-bold text-[var(--primary)] mb-1 truncate w-full">{place.name}</h3>
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
        </section>

        {/* 4. Botón "See more" */}
        <div className="mt-14 w-full flex justify-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary text-sm px-10" 
          >
            See more
          </motion.button>
        </div>
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
