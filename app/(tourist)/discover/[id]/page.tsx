'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/tourist/Navbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { motion } from 'framer-motion';

/**
 * Interface for place details
 */
interface PlaceDetails {
  id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  address: string;
  description: string;
  opening_hours: string[];
  photos: string[];
}

/**
 * Mock data for the specific place (this would come from the backend/lib)
 */
const MOCK_PLACES_DETAILS: Record<string, PlaceDetails> = {
  '1': {
    id: '1',
    name: 'Sabores de Antaño',
    rating: 4.7,
    user_ratings_total: 842,
    address: 'Calle Colima 124, Colonia Roma Norte, CDMX',
    description: 'A traditional Mexican eatery where every dish tells a story. Specializing in mole and handmade tortillas, this local gem offers an authentic experience away from the tourist traps.',
    opening_hours: ['Mon: 13:00 - 22:00', 'Tue-Sat: 09:00 - 22:00', 'Sun: 09:00 - 18:00'],
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'
    ]
  },
};

export default function PlaceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // Get data or use fallback
  const place = MOCK_PLACES_DETAILS[id as string] || MOCK_PLACES_DETAILS['1'];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar fija */}
      <Navbar variant="light" />

      <main className="pt-20 pb-20">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--primary)] font-bold hover:opacity-70 transition-opacity"
          >
            <ArrowBackIcon fontSize="small" /> Back to Discover
          </button>
        </div>

        {/* Hero Gallery */}
        <section className="w-full h-[300px] md:h-[450px] relative overflow-hidden px-4 max-w-7xl mx-auto">
          <div 
            className="w-full h-full rounded-[var(--radius-xl)] shadow-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${place.photos[0]})` }}
          >
            <div className="absolute inset-0 bg-black/10 rounded-[var(--radius-xl)]"></div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-6xl mx-auto px-6 mt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            
            {/* Left Column: Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-[var(--primary)] mb-2" style={{ fontFamily: 'var(--font-display, inherit)' }}>
                {place.name}
              </h1>
              
              {/* Rating Section */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} fontSize="small" className={i < Math.floor(place.rating) ? 'text-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
                <span className="font-bold text-gray-700">{place.rating}</span>
                <span className="text-gray-400 text-sm">({place.user_ratings_total.toLocaleString()} reviews)</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8">
                {place.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {place.photos.slice(1).map((photo, idx) => (
                  <div key={idx} className="aspect-square rounded-xl bg-gray-100 overflow-hidden shadow-sm">
                    <img src={photo} alt={`${place.name} ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Details Card + Map */}
            <aside className="w-full lg:w-[380px] flex flex-col gap-6">
              <div className="bg-[var(--background)] p-6 rounded-[var(--radius-xl)] border border-gray-100 shadow-sm">
                <h4 className="font-bold text-[var(--primary)] mb-4 uppercase tracking-wider text-xs">Information</h4>
                
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex gap-3">
                    <LocationOnIcon className="text-[var(--color-accent)]" fontSize="small" />
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Address</p>
                      <p className="text-sm text-gray-700 font-medium">{place.address}</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-3">
                    <AccessTimeIcon className="text-[var(--color-accent)]" fontSize="small" />
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Opening Hours</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {place.opening_hours.map((hour, i) => (
                          <li key={i}>{hour}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botón Itinerario: Más ancho y altura reducida */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-8 bg-[var(--color-accent)] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:brightness-110 transition-all text-sm uppercase tracking-wide"
                >
                  Add to Itinerary
                </motion.button>
              </div>

              {/* Mapa de ubicación (Placeholder Visual) */}
              <div className="w-full h-[250px] bg-gray-200 rounded-[var(--radius-xl)] overflow-hidden relative shadow-inner group border border-gray-100">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-99.1620,19.4194,14,0/400x300?access_token=none')] bg-cover opacity-80 group-hover:opacity-100 transition-opacity">
                  {/* Pin representativo */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--primary)] drop-shadow-lg">
                    <LocationOnIcon fontSize="large" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-600 uppercase">Interactive Map View</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
