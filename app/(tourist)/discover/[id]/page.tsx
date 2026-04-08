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

      <main className="pt-20 pb-20 px-4">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--primary)] font-bold hover:opacity-70 transition-opacity"
          >
            <ArrowBackIcon fontSize="small" /> Back to Discover
          </button>
        </div>

        {/* Main Content Section */}
        <section className="max-w-6xl mx-auto mt-4">
          {/* Header: Title and Rating (Full Width) */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black text-[var(--primary)] mb-3" style={{ fontFamily: 'var(--font-display, inherit)' }}>
              {place.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} fontSize="small" className={i < Math.floor(place.rating) ? 'text-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
              <span className="font-bold text-gray-700">{place.rating}</span>
              <span className="text-gray-400 text-sm">({place.user_ratings_total.toLocaleString()} reviews)</span>
            </div>
          </div>

          {/* Symmetrical Two-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Left Column: Image + Description + Small Gallery */}
            <div className="flex-1 lg:w-3/5">
              {/* Recropped Image */}
              <div 
                className="w-full h-[400px] rounded-[var(--radius-xl)] shadow-lg bg-cover bg-center mb-8 border border-gray-100"
                style={{ backgroundImage: `url(${place.photos[0]})` }}
              >
                <div className="absolute inset-0 bg-black/5 rounded-[var(--radius-xl)]"></div>
              </div>

              {/* Description */}
              <div className="prose prose-slate max-w-none mb-10">
                <h4 className="text-[var(--primary)] font-bold mb-3 uppercase tracking-widest text-xs">About this business</h4>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {place.description}
                </p>
              </div>

              {/* Secondary Photos */}
              <div className="grid grid-cols-3 gap-4">
                {place.photos.slice(1).map((photo, idx) => (
                  <div key={idx} className="aspect-square rounded-xl bg-gray-100 overflow-hidden shadow-sm border border-gray-50">
                    <img src={photo} alt={`${place.name} ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Information Card + Map */}
            <aside className="w-full lg:w-[380px] flex flex-col gap-6">
              {/* Info Card */}
              <div className="bg-[var(--background)] p-8 rounded-[var(--radius-xl)] border border-gray-100 shadow-sm">
                <h4 className="font-bold text-[var(--primary)] mb-6 uppercase tracking-wider text-xs">Business Details</h4>
                
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm h-fit">
                      <LocationOnIcon className="text-[var(--color-accent)]" fontSize="small" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Location</p>
                      <p className="text-sm text-gray-700 font-semibold leading-snug">{place.address}</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm h-fit">
                      <AccessTimeIcon className="text-[var(--color-accent)]" fontSize="small" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Opening Hours</p>
                      <ul className="text-sm text-gray-600 space-y-1 font-medium">
                        {place.opening_hours.map((hour, i) => (
                          <li key={i}>{hour}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Optimized Button */}
                <motion.button 
                  whileHover={{ scale: 1.02, brightness: 1.1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-10 bg-[var(--color-accent)] text-white font-black py-3 px-6 rounded-xl shadow-lg transition-all text-xs uppercase tracking-widest"
                >
                  Add to Itinerary
                </motion.button>
              </div>

              {/* Map Card */}
              <div className="w-full h-[300px] bg-gray-100 rounded-[var(--radius-xl)] overflow-hidden relative shadow-md border border-gray-100 group">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-99.1620,19.4194,14,0/400x300?access_token=none')] bg-cover transition-transform duration-700 group-hover:scale-105">
                  {/* Visual Pin */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--primary)] drop-shadow-xl">
                    <LocationOnIcon fontSize="large" />
                  </div>
                </div>
                {/* Overlay label */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-tighter">View on Maps</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
