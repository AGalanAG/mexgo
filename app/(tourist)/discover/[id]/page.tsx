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

      <main className="pt-24 pb-20 px-4 bg-white">
        {/* Back Button - Aligned to the container */}
        <div className="max-w-6xl mx-auto mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--primary)] font-bold hover:opacity-70 transition-opacity text-sm"
          >
            <ArrowBackIcon fontSize="small" /> Back to Discover
          </button>
        </div>

        {/* Symmetric Header: Centered */}
        <section className="max-w-6xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-[var(--primary)] mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display, inherit)' }}>
            {place.name}
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} fontSize="small" className={i < Math.floor(place.rating) ? 'text-yellow-400' : 'text-gray-200'} />
              ))}
            </div>
            <span className="font-bold text-gray-800 text-lg">{place.rating}</span>
            <span className="text-gray-400 text-sm font-medium">({place.user_ratings_total.toLocaleString()} reviews)</span>
          </div>
        </section>

        {/* 50/50 Symmetric Grid */}
        <section className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column: Balanced Visual Block */}
            <div className="flex flex-col gap-8">
              <div 
                className="w-full h-[550px] rounded-[var(--radius-xl)] shadow-xl bg-cover bg-center border border-gray-100 overflow-hidden"
                style={{ backgroundImage: `url(${place.photos[0]})` }}
              >
                <div className="absolute inset-0 bg-black/5"></div>
              </div>
              
              {/* Short description below the main image to maintain the column structure */}
              <div className="p-2">
                <h4 className="text-[var(--primary)] font-bold mb-4 uppercase tracking-widest text-xs border-b border-gray-100 pb-2">Experience Overview</h4>
                <p className="text-gray-600 leading-relaxed text-lg italic">
                  "{place.description}"
                </p>
              </div>
            </div>

            {/* Right Column: Stacked Cards (Matching the left block height) */}
            <div className="flex flex-col gap-6 h-full">
              {/* Business Details Card */}
              <div className="bg-[var(--background)] p-10 rounded-[var(--radius-xl)] border border-gray-100 shadow-sm flex-1 flex flex-col justify-center">
                <h4 className="font-bold text-[var(--primary)] mb-8 uppercase tracking-wider text-xs text-center">Business Information</h4>
                
                <div className="space-y-8 mb-10">
                  <div className="flex items-center gap-6">
                    <div className="bg-white p-3 rounded-xl shadow-md text-[var(--color-accent)]">
                      <LocationOnIcon />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Our Location</p>
                      <p className="text-base text-gray-800 font-bold leading-tight">{place.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="bg-white p-3 rounded-xl shadow-md text-[var(--color-accent)]">
                      <AccessTimeIcon />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Service Hours</p>
                      <ul className="text-sm text-gray-600 font-bold grid grid-cols-2 gap-x-4">
                        {place.opening_hours.map((hour, i) => (
                          <li key={i} className="whitespace-nowrap">{hour}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, elevation: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[var(--color-accent)] text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all text-sm uppercase tracking-[0.2em]"
                >
                  Add to Itinerary
                </motion.button>
              </div>

              {/* Map Card - Balanced height */}
              <div className="w-full h-[280px] bg-gray-100 rounded-[var(--radius-xl)] overflow-hidden relative shadow-lg border border-gray-100 group">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-99.1620,19.4194,14,0/500x300?access_token=none')] bg-cover transition-transform duration-1000 group-hover:scale-110">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--primary)] drop-shadow-2xl">
                    <LocationOnIcon sx={{ fontSize: 50 }} />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white font-bold text-xs uppercase tracking-widest">Open in Google Maps</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Symmetrical Bottom Gallery */}
        <section className="max-w-6xl mx-auto mt-20">
          <h4 className="text-center text-[var(--primary)] font-black uppercase tracking-widest text-xs mb-10">Gallery</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {place.photos.map((photo, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -10 }}
                className="aspect-square rounded-2xl bg-gray-100 overflow-hidden shadow-md border border-gray-100"
              >
                <img src={photo} alt={`${place.name} ${idx}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
