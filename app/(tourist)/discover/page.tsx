'use client';

import React, { useState } from 'react';
import Navbar from '@/components/tourist/Navbar';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Interface for static place data
 */
interface StaticPlace {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Static data for recommendations
 */
const RECOMMENDED_PLACES: StaticPlace[] = [
  {
    id: '1',
    name: 'Bellas Artes',
    imageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&q=80',
  },
  {
    id: '2',
    name: 'Castillo de Chapultepec',
    imageUrl: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=600&q=80',
  },
  {
    id: '3',
    name: 'Xochimilco',
    imageUrl: 'https://images.unsplash.com/photo-1547995886-6dc09384c6e8?w=600&q=80',
  },
  {
    id: '4',
    name: 'Coyoacán',
    imageUrl: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&q=80',
  },
];

export default function DiscoverPage() {
  const [searchValue, setSearchValue] = useState<string>('');

  const clearSearch = (): void => setSearchValue('');

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* 1. Navbar fija arriba */}
      <Navbar variant="light" />

      {/* Padding-top to avoid content being hidden under fixed navbar */}
      <main className="pt-24 pb-16 px-4 flex flex-col items-center w-full max-w-7xl mx-auto">
        
        {/* 2. Barra de búsqueda */}
        <div className="w-full mb-10">
          <div className="relative flex items-center bg-gray-100 rounded-full border border-gray-200 overflow-hidden px-4 py-3 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:bg-white">
            {/* Ícono X a la izquierda */}
            <button 
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <CloseIcon fontSize="small" />
            </button>
            
            <input
              type="text"
              placeholder="Search places, activities..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-3 text-[var(--text-primary)] font-medium placeholder-gray-400"
            />
            
            {/* Ícono de lupa a la derecha */}
            <SearchIcon className="text-gray-400" />
          </div>
        </div>

        {/* 3. Sección "Recommendations" */}
        <section className="w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-[var(--primary)]" style={{ fontFamily: 'var(--font-display, inherit)' }}>
            Recommendations
          </h2>
          
          {/* Vertical list on mobile, 2 columns on desktop (1024px+) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {RECOMMENDED_PLACES.map((place) => (
              <div 
                key={place.id}
                className="relative w-full overflow-hidden shadow-[var(--shadow-md)] group transition-transform hover:scale-[1.01]"
                style={{ 
                  height: '220px', 
                  borderRadius: 'var(--radius-xl, 1.5rem)',
                  backgroundImage: `url(${place.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Subtle overlay for better badge readability */}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-all"></div>
                
                {/* Nombre del lugar en badge verde (estilo badge-ola) */}
                <div className="absolute bottom-4 left-4">
                  <span 
                    className="inline-block text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-sm"
                    style={{ backgroundColor: 'var(--color-accent, var(--accent, #006341))' }}
                  >
                    {place.name}
                  </span>
                </div>
                
                {/* Botón ">>>" abajo a la derecha — placeholder visual */}
                <div className="absolute bottom-4 right-4">
                  <button className="bg-white/90 hover:bg-white text-[var(--primary)] w-12 h-10 rounded-xl flex items-center justify-center font-black transition-all shadow-md">
                    &gt;&gt;&gt;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Botón "See more" centrado al final */}
        <div className="mt-14 w-full flex justify-center">
          <button className="btn-primary" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
            See more
          </button>
        </div>
      </main>
    </div>
  );
}
