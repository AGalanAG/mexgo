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
    name: 'Sabores de Antaño',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    description: 'Authentic traditional cuisine with recipes passed down through generations.',
    location: 'Colonia Roma, CDMX'
  },
  {
    id: '2',
    name: 'El Rincón del Arte',
    imageUrl: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=600&q=80',
    description: 'A cozy gallery showcasing local contemporary artists and handmade crafts.',
    location: 'Coyoacán, CDMX'
  },
  {
    id: '3',
    name: 'Café Luna Nueva',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    description: 'Specialty coffee from organic beans harvested in Veracruz and Oaxaca.',
    location: 'Condesa, CDMX'
  },
  {
    id: '4',
    name: 'Textiles del Sur',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',
    description: 'Hand-woven garments and accessories using ancient natural dyeing techniques.',
    location: 'San Ángel, CDMX'
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
