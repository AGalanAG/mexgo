'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/tourist/Navbar';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { NegocioConScore } from '@/types/types';

interface DirectoryBusinessItem {
  businessId: string;
  publicName: string;
  shortDescription: string;
  badgeCodes: string[];
  city: string | null;
  state: string | null;
  publicScore: number;
  businessName: string;
  businessDescription: string;
  borough: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  operationDaysHours: string | null;
  coverImageUrl: string | null;
}

interface DirectoryBusinessesResponse {
  ok: boolean;
  data?: {
    items: DirectoryBusinessItem[];
  };
}

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

function toRecommendation(item: DirectoryBusinessItem): NegocioConScore {
  const latitude = Number(item.latitude ?? 19.4326);
  const longitude = Number(item.longitude ?? -99.1332);

  return {
    id: item.businessId,
    businessRequestId: item.businessId,
    ownerUserId: 'public-directory',
    businessName: item.businessName || item.publicName,
    businessDescription: item.businessDescription || item.shortDescription,
    boroughCode: item.borough || item.state || 'N/A',
    neighborhood: item.neighborhood || item.city || 'N/A',
    latitude,
    longitude,
    locationSource: 'directory',
    operationDaysHours: item.operationDaysHours || 'Horario no disponible',
    socialLinks: [],
    coverImageUrl: item.coverImageUrl || undefined,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    score: Number(item.publicScore ?? 0),
    reasons: item.badgeCodes.length > 0 ? item.badgeCodes : ['negocio verificado Ola Mexico'],
    estimatedWalkMinutes: 10,
  };
}

export default function DiscoverPage() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [places, setPlaces] = useState<DisplayPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Discover');

  useEffect(() => {
    let cancelled = false;

    async function loadBusinesses() {
      try {
        setLoading(true);
        const response = await fetch('/api/directory/businesses?page=1&pageSize=100', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Error cargando negocios: ${response.status}`);
        }

        const payload = (await response.json()) as DirectoryBusinessesResponse;
        const items = payload.data?.items || [];
        const negocios = items.map(toRecommendation);

        if (!cancelled) {
          localStorage.setItem('mexgo_recommendations', JSON.stringify(negocios));
          setPlaces(negocios.map(toDisplay));
        }
      } catch {
        if (!cancelled) {
          setPlaces([]);
          localStorage.setItem('mexgo_recommendations', JSON.stringify([]));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBusinesses();

    return () => {
      cancelled = true;
    };
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
      <Navbar />

      <main className="py-16 px-6 max-w-7xl mx-auto w-full flex-1 flex flex-col items-center">
        {/* Header section centered */}
        <div className="w-full max-w-3xl text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--primary)] mb-3 tracking-tight">
            {t('title')}
          </h2>
          <div className="w-16 h-1.5 bg-[var(--secondary)] rounded-full mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs mb-8">
            {t('recommendations')}
          </p>

          {/* Centered Search bar */}
          <div className="relative flex items-center bg-surface rounded-[2rem] border-2 border-gray-100 overflow-hidden px-6 py-4 shadow-xl shadow-gray-200/50 transition-all focus-within:ring-4 focus-within:ring-[var(--primary)]/5 focus-within:border-[var(--primary)] w-full">
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
            <div className="w-12 h-12 border-4 border-[var(--secondary)] border-t-[var(--primary)] rounded-full animate-spin mb-6"></div>
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
                  className="absolute inset-0 backface-hidden bg-surface shadow-2xl flex flex-col p-8 rotate-y-180 border border-gray-50 text-center items-center justify-center"
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
                    className="btn-primary w-full text-center text-[10px] uppercase tracking-[0.2em]"
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary uppercase tracking-[0.3em] text-[10px] py-5 px-16"
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

    </div>
  );
}
